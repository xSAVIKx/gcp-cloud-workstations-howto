import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as docker from "@pulumi/docker";
import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";
import { GoogleAuth } from "google-auth-library";

const __dirname = dirname(fileURLToPath(import.meta.url));

const region = "us-central1";
const gcpProvider = new gcp.Provider("gcpProvider", {
  project: gcp.config.project,
  region: region,
  defaultLabels: { team: "devops" },
});

const enableServices = (services: string[]) => {
  return services.map((service) => {
    return new gcp.projects.Service(
      service,
      {
        service: service,
        project: gcp.config.project,
      },
      { provider: gcpProvider },
    );
  });
};

const requiredServices = [
  "compute.googleapis.com",
  "workstations.googleapis.com",
  "artifactregistry.googleapis.com",
  "container.googleapis.com",
];

const services = enableServices(requiredServices);

function defineRunnerSa() {
  const sa = new gcp.serviceaccount.Account(
    `wsRunnerSa`,
    {
      accountId: `workstations-runner`,
      description: `Runs Cloud Workstations VMs`,
      displayName: `Workstations Runner Service Account`,
    },
    {
      provider: gcpProvider,
      dependsOn: services,
    },
  );
  const roles = [
    "roles/iam.serviceAccountUser",
    "roles/artifactregistry.reader",
    "roles/writer",
  ];
  const iamRoles = roles.map((role) => {
    return new gcp.projects.IAMMember(
      `wsRunnerSa-role-${role.split("/")[1]}`,
      {
        role,
        member: pulumi.interpolate`serviceAccount:${sa.email}`,
        project: gcp.config.project || "",
      },
      { provider: gcpProvider, parent: sa },
    );
  });
  return { sa, iamRoles };
}

function defineNetwork() {
  const wsNetwork = new gcp.compute.Network(
    "wsNetwork",
    {
      autoCreateSubnetworks: false,
    },
    {
      provider: gcpProvider,
      dependsOn: services,
    },
  );
  const wsSubnetwork = new gcp.compute.Subnetwork(
    "wsUsCentral1Subnet",
    {
      network: wsNetwork.id,
      region: region,
      ipCidrRange: "10.128.0.0/20",
    },
    {
      provider: gcpProvider,
      parent: wsNetwork,
    },
  );
  return { wsNetwork, wsSubnetwork };
}

function defineArtifactRegistry() {
  const artifactRegistry = new gcp.artifactregistry.Repository(
    "dockerRegistry",
    {
      location: region,
      repositoryId: "containers",
      description: "Private containers registry",
      format: "DOCKER",
      dockerConfig: {
        // usually better set to `true`, but for the lab we're setting it to false
        // to ease re-creation of the same containers.
        immutableTags: false,
      },
    },
    { provider: gcpProvider, dependsOn: services },
  );
  return { artifactRegistry };
}

async function accessToken() {
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  return (await auth.getAccessToken()) || undefined;
}

export default async function main() {
  const { wsNetwork, wsSubnetwork } = defineNetwork();
  const { artifactRegistry } = defineArtifactRegistry();
  const { sa } = defineRunnerSa();
  const webstormImage = new docker.Image("webstormImage", {
    build: {
      context: `${__dirname}/base_images/webstorm`,
      dockerfile: `${__dirname}/base_images/webstorm/Dockerfile`,
      platform: "linux/amd64",
    },
    imageName: pulumi.interpolate`${artifactRegistry.registryUri}/webstorm:latest`,
    registry: {
      server: artifactRegistry.registryUri,
      username: "oauth2accesstoken",
      password: await accessToken(),
    },
    skipPush: false,
  });

  const wsCluster: gcp.workstations.WorkstationCluster =
    new gcp.workstations.WorkstationCluster(
      "developmentCluster",
      {
        workstationClusterId: "customized-cluster",
        network: wsNetwork.id,
        subnetwork: wsSubnetwork.id,
        location: region,
        displayName: "Customized Cluster",
        annotations: {
          description: "Customized cluster for testing",
        },
        labels: {
          purpose: "customized",
        },
      },
      { provider: gcpProvider, dependsOn: services },
    );
  const wsCustomizedConfig = new gcp.workstations.WorkstationConfig(
    "wsCustomizedConfig",
    {
      workstationConfigId: "customized-config",
      workstationClusterId: wsCluster.workstationClusterId,
      location: region,
      container: {
        image: webstormImage.repoDigest,
      },
      idleTimeout: "3600s",
      runningTimeout: "43200s",
      host: {
        gceInstance: {
          machineType: "e2-standard-4",
          serviceAccount: sa.email,
          disableSsh: false,
          serviceAccountScopes: [
            "https://www.googleapis.com/auth/cloud-platform",
          ],
        },
      },
      persistentDirectories: [
        {
          mountPath: "/home",
          gcePd: {
            diskType: "pd-standard",
            sizeGb: 200,
            reclaimPolicy: "DELETE",
          },
        },
      ],
    },
    { provider: gcpProvider, dependsOn: services, deleteBeforeReplace: true },
  );
  const workstation = new gcp.workstations.Workstation(
    "customized-workstation",
    {
      workstationId: "customized-workstation",
      workstationConfigId: wsCustomizedConfig.workstationConfigId,
      workstationClusterId: wsCluster.workstationClusterId,
      location: region,
    },
    { provider: gcpProvider, dependsOn: services },
  );
  return {
    wsCluster: wsCluster.name,
    wsConfig: wsCustomizedConfig.name,
    workstation: workstation.host,
    artifactRegistry: artifactRegistry.registryUri,
  };
}
