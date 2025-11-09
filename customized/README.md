# customized — Pulumi GCP Workstations (using customized images)

This setup provisions a Google Cloud Workstations cluster with customized images.

The program enables required Google APIs automatically and uses Pulumi stack config to determine the
GCP project.

## Prerequisites (required tools)

- Pulumi CLI (v3.x or newer): https://www.pulumi.com/docs/install/
- Bun 1.3+ (used as the package manager defined in Pulumi.yaml): https://bun.com
- Google Cloud SDK (gcloud) OR a GCP service account key you can point to with
  `GOOGLE_APPLICATION_CREDENTIALS`:
    - https://cloud.google.com/sdk/docs/install
    - Ensure your GCP project has billing enabled and you have sufficient IAM permissions.

## Install dependencies

From the `customized` folder:

```bash
bun install
```

## Pulumi environments (stacks)

Pulumi uses "stacks" to represent environments (e.g., `main`, `dev`, `prod`). This project includes
an example stack config file for a stack named `main`.

Common commands:

- Initialize a new stack:
    - `pulumi stack init main` (or `dev`, `prod`, etc.)
- List stacks: `pulumi stack ls`
- Select a stack: `pulumi stack select main`
- View stack config: `pulumi config`
- Set a config value: `pulumi config set gcp:project <your-gcp-project-id>`

Secrets management:

- If using the local backend (default), consider setting `PULUMI_CONFIG_PASSPHRASE` to encrypt
  secrets locally.
- Or `pulumi login` to the Pulumi Service (app.pulumi.com) for managed secrets and state.

## Create your stack config (Pulumi.main.yaml)

You must create your own `Pulumi.main.yaml` from the provided example:

```bash
# from the customized directory
cp Pulumi.main.yaml.example Pulumi.main.yaml        # bash
# or, on PowerShell:
Copy-Item Pulumi.main.yaml.example Pulumi.main.yaml # PowerShell
```

Then edit `Pulumi.main.yaml` and set your project:

```yaml
config:
  gcp:project: <your-gcp-project-goes-here>
```

Alternatively, you can set it via Pulumi CLI (writes to the same file for the selected stack):

```bash
pulumi stack select main
pulumi config set gcp:project <your-gcp-project-id>
```

## Authenticate to Google Cloud

Choose one of the following:

- Using gcloud (Application Default Credentials):
    - `gcloud auth application-default login`
- Using a service account key file:
    - Set `GOOGLE_APPLICATION_CREDENTIALS` to the key file path (PowerShell example):
        - `$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\key.json"`

## Deploy

From the `customized` directory:

```bash
pulumi up
```

This will run the program in `index.ts`, enable required services, create a VPC/subnet, a
Workstations cluster, and a customized workstation config in `us-central1`.

Useful commands:

- Preview changes: `pulumi preview`
- Show outputs: `pulumi stack output`
- Destroy all resources: `pulumi destroy`
- Remove the stack (after destroy): `pulumi stack rm main`

## Notes

- APIs enabled by this program: `compute.googleapis.com`, `workstations.googleapis.com`.
- Runtime is Node.js; Bun is used as the package manager as defined in `Pulumi.yaml`.
- Optional: you may run the TypeScript with Bun for quick checks, but deployment must be done with
  Pulumi:
    - `bun run index.ts` (does not create resources; use `pulumi up` to deploy)
