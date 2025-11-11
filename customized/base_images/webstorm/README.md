WebStorm Base Image for Google Cloud Workstations

Overview

- This directory contains a custom base image built on top of the official Google Cloud Workstations
  WebStorm image, with additional tooling and editor integrations preinstalled for full‑stack
  JavaScript/TypeScript development.
- Base images used:
    - Runtime: `us-central1-docker.pkg.dev/cloud-workstations-images/predefined/webstorm:latest`
    - Code OSS tools source:
      `us-central1-docker.pkg.dev/cloud-workstations-images/predefined/code-oss:latest`

What’s included

1) JetBrains plugins preinstalled (into `/opt/WebStorm/plugins`)
    - .env files: ID `9525` — https://plugins.jetbrains.com/plugin/9525--env-files
    - .ignore: ID `7495` — https://plugins.jetbrains.com/plugin/7495--ignore
    - Google Cloud Code: ID `8079` — https://plugins.jetbrains.com/plugin/8079-google-cloud-code
    - Gemini Code Assist: ID `24198` — https://plugins.jetbrains.com/plugin/24198-gemini-code-assist
    - JetBrains AI Assistant: ID
      `22282` — https://plugins.jetbrains.com/plugin/22282-jetbrains-ai-assistant
    - JetBrains Junie: ID `26104` — https://plugins.jetbrains.com/plugin/26104-jetbrains-junie

2) VS Code (Code OSS) available alongside WebStorm
    - The image copies Code OSS to `/opt/code-oss` and starts it via
      `/etc/workstation-startup.d/110_start-code-oss.sh`.
    - On first boot, the script `120_install_vs_code_extensions.sh` installs commonly used
      extensions for the `user` account:
        - ms-azuretools.vscode-containers
        - pulumi.pulumi-vscode-tools
        - GoogleCloudTools.cloudcode
        - Google.geminicodeassist
        - cweijan.vscode-database-client2
        - cweijan.dbclient-jdbc
        - RooVeterinaryInc.roo-cline
        - redhat.vscode-yaml
        - dbaeumer.vscode-eslint
        - orta.vscode-jest
        - gamunu.vscode-yarn

3) CLIs and system tools
    - GitHub CLI (`gh`)
    - Redis client (from packages.redis.io)
    - MariaDB client (`mariadb-client`)
    - Lefthook (pre-commit hooks runner)
    - Bun runtime (via upstream image layer + official installer)
    - uv and uvx (Python packaging/runtime manager) copied from `astral/uv:0.9.8` to `/bin`

4) JavaScript/TypeScript toolchain and developer conveniences
    - nvm installed for the `user` with latest LTS Node.js
    - npm global: `corepack` enabled and `@google/gemini-cli` installed

5) IaC / Cloud developer tools
    - Pulumi CLI pinned by `PULUMI_VERSION` (default: 3.193.0), installed to `~/.pulumi/bin`
    - Cloud SQL Auth Proxy pinned by `CLOUD_SQL_PROXY_VERSION` (default: 2.19.0) into
      `~/.local/bin/cloud-sql-proxy`

Startup and customization

- Startup scripts are placed under `/etc/workstation-startup.d/` and executed by the Workstations
  base image on boot:
    - `011_customize_user.sh`
        - Creates directories under `/home/user` and copies `/tmp/customize_environment.sh` to
          `/home/user/.workstation/customize_environment`.
        - Ensures the script is owned by `user` and is executable.
    - `120_install_vs_code_extensions.sh`
        - Installs the listed Code OSS extensions for the `user` account.

- Per-user environment customization
    - The file `customize_environment.sh` is copied into the instance at
      `/home/user/.workstation/customize_environment`.
    - It performs the following on execution:
        - Installs Pulumi CLI (specific version) and symlinks `pulumi` to `~/.local/bin`.
        - Installs `pre-commit` via uv and updates shell integration (`uv tool update-shell`).
        - Installs nvm, loads it, installs Node.js LTS, and sets up global npm tools.
        - Downloads the Cloud SQL Auth Proxy if not already present.
    - You may run it manually as the `user` to (re)apply or update the environment:
        - `bash ~/.workstation/customize_environment`

Build

1) Local Docker build
    - From the repository root or this directory:
        - `docker build -t webstorm-workstations:latest -f base_images/webstorm/Dockerfile .`

2) Push to Artifact Registry (example)
    - Replace `PROJECT_ID` and optionally region/repo as needed. The official workstations images
      come from `us-central1-docker.pkg.dev`.
    - Create a repo if needed (one time):
        -
        `gcloud artifacts repositories create workstations --repository-format=docker --location=us-central1`
    - Configure Docker to authenticate:
        - `gcloud auth configure-docker us-central1-docker.pkg.dev`
    - Tag and push:
        -
        `docker tag webstorm-workstations:latest us-central1-docker.pkg.dev/PROJECT_ID/workstations/webstorm-workstations:latest`
        -
        `docker push us-central1-docker.pkg.dev/PROJECT_ID/workstations/webstorm-workstations:latest`

Use with Google Cloud Workstations

- In your Workstation Config, reference the pushed image. Example snippet (YAML‑like pseudocode):
    - image: `us-central1-docker.pkg.dev/PROJECT_ID/workstations/webstorm-workstations:latest`
- This repository also contains Pulumi code you can adapt to point at the same image.

Environment variables and versions

- The Dockerfile and scripts honor these version variables (defaults shown):
    - `PULUMI_VERSION=3.193.0`
    - `CLOUD_SQL_PROXY_VERSION=2.19.0`
- To change, update `customize_environment.sh` accordingly.

Troubleshooting

- Code OSS extensions didn’t appear:
    - Ensure the startup script `120_install_vs_code_extensions.sh` ran successfully. Check logs
      under `/var/log` or the Workstations startup logs. You can re-run the script manually as root:
      `bash /etc/workstation-startup.d/120_install_vs_code_extensions.sh`.
- `pulumi` not found after login:
    - The script creates a symlink to `~/.local/bin`. Ensure your PATH includes `~/.local/bin`. Open
      a new shell session or source your shell profile.
- Node.js unavailable:
    - Run `bash ~/.workstation/customize_environment` to execute the nvm installation and Node.js
      LTS setup for the `user`.
- Cloud SQL Proxy missing:
    - The script places it at `~/.local/bin/cloud-sql-proxy` if not present. Re-run the
      customization script.

Security and notes

- This image installs third‑party tools and adds external apt repositories (Redis, GitHub CLI).
  Review the Dockerfile before trusting in production environments.
- JetBrains marketplace plugin IDs are pinned by number but resolve to latest compatible plugin
  versions at build time.
- The image uses `apt upgrade -y` during build to apply updates to base packages.

File map

- `Dockerfile` — defines the image build.
- `011_customize_user.sh` — prepares per‑user customization script location and permissions.
- `120_install_vs_code_extensions.sh` — installs Code OSS extensions for the `user`.
- `customize_environment.sh` — per‑user environment bootstrap invoked manually when you want to set
  up or refresh your dev tools.

License

- Follows the licensing of upstream base images and tools. Verify each tool/plugin’s license for
  your usage.
