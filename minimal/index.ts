import * as gcp from "@pulumi/gcp";

const region = "us-central1";
const gcpProvider = new gcp.Provider("gcpProvider", {
    project: gcp.config.project,
    region: region,
    defaultLabels: {team: "devops"}
});

const enableServices = (services: string[]) => {
    return services.map(service => {
        return new gcp.projects.Service(service, {
            service: service,
            project: gcp.config.project,
        }, {provider: gcpProvider})
    })
}

const requiredServices = [
    "compute.googleapis.com",
    "workstations.googleapis.com"
]

const services = enableServices(requiredServices);

export default function main() {
    const wsNetwork = new gcp.compute.Network("wsNetwork", {
        autoCreateSubnetworks: false,
    }, {
        provider: gcpProvider,
        dependsOn: services
    });
    const wsSubnetwork = new gcp.compute.Subnetwork("wsUsCentral1Subnet", {
        network: wsNetwork.id,
        region: region,
        ipCidrRange: "10.128.0.0/20",
    }, {
        provider: gcpProvider,
        parent: wsNetwork
    });
    const wsCluster: gcp.workstations.WorkstationCluster = new gcp.workstations.WorkstationCluster(
        "developmentCluster",
        {
            workstationClusterId: "test-cluster",
            network: wsNetwork.id,
            subnetwork: wsSubnetwork.id,
            location: region,
            displayName: "Test Cluster",
            annotations: {
                description: "Minimal cluster for testing"
            },
            labels: {
                purpose: "test"
            },
        },
        {provider: gcpProvider, dependsOn: services}
    );
    const wsMinimalConfig = new gcp.workstations.WorkstationConfig(
        "wsMinimalConfig",
        {
            workstationConfigId: "minimal-config",
            workstationClusterId: wsCluster.workstationClusterId,
            location: region,
        },
        {provider: gcpProvider, dependsOn: services}
    )
    return {
        wsCluster: wsCluster.name,
        wsConfig: wsMinimalConfig.name
    }
}
