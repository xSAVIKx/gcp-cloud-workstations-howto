#!/usr/bin/env bash

sudo -u user /opt/code-oss/bin/codeoss-cloudworkstations \
  --install-extension ms-azuretools.vscode-containers \
  --install-extension pulumi.pulumi-vscode-tools  \
  --install-extension GoogleCloudTools.cloudcode \
  --install-extension Google.geminicodeassist \
  --install-extension cweijan.vscode-database-client2 \
  --install-extension cweijan.dbclient-jdbc \
  --install-extension RooVeterinaryInc.roo-cline \
  --install-extension redhat.vscode-yaml \
  --install-extension dbaeumer.vscode-eslint \
  --install-extension orta.vscode-jest \
  --install-extension gamunu.vscode-yarn
