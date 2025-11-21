#!/usr/bin/env bash

set -x;
export DEBIAN_FRONTEND=noninteractive
export PULUMI_VERSION="3.208.0"
export CLOUD_SQL_PROXY_VERSION="2.19.0"

curl -fsSL https://get.pulumi.com | bash -s -- --version "${PULUMI_VERSION}"

# This is required for some tools that source from local bin but ignore bashrc
sudo ln -s ~/.pulumi/bin/pulumi ~/.local/bin

uv tool install pre-commit
uv tool update-shell

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

nvm install --lts
npm install -g corepack @google/gemini-cli

# Download Cloud SQL proxy
if [ ! -f ~/.local/bin/cloud-sql-proxy ]; then
    mkdir -p ~/.local/bin
    curl -o ~/.local/bin/cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v${CLOUD_SQL_PROXY_VERSION}/cloud-sql-proxy.linux.amd64
    chmod +x ~/.local/bin/cloud-sql-proxy
fi
