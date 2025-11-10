FROM us-central1-docker.pkg.dev/cloud-workstations-images/predefined/code-oss:latest AS code-oss-image

FROM europe-west2-docker.pkg.dev/cloud-workstations-images/predefined/webstorm:latest AS runtime

# See https://github.com/helm/helm/issues/31229
RUN rm /etc/apt/sources.list.d/helm-stable-debian.list

RUN apt update \
    && DEBIAN_FRONTEND=noninteractive apt install apt-utils software-properties-common unzip -fyq \
    && apt upgrade -fyq \
    # Install MySQL client \
    && DEBIAN_FRONTEND=noninteractive apt install mariadb-client -yq \
    # Install Redis Client \
    && curl -fsSL https://packages.redis.io/gpg | gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg \
    && chmod 644 /usr/share/keyrings/redis-archive-keyring.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/redis.list \
    && apt update \
    && DEBIAN_FRONTEND=noninteractive apt install redis -yq \
    # Install GitHub CLI \
    && mkdir -p -m 755 /etc/apt/keyrings \
    && out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    && cat $out | tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
    && chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
    && mkdir -p -m 755 /etc/apt/sources.list.d \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt update \
    && DEBIAN_FRONTEND=noninteractive apt install gh -yq \
    # Install lefthook \
    && curl -1sLf 'https://dl.cloudsmith.io/public/evilmartians/lefthook/setup.deb.sh' | sudo -E bash \
    && DEBIAN_FRONTEND=noninteractive apt install lefthook -yq \
    # Install Helm \
    && curl -fsSL https://packages.buildkite.com/helm-linux/helm-debian/gpgkey | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null \
    && echo "deb [signed-by=/usr/share/keyrings/helm.gpg] https://packages.buildkite.com/helm-linux/helm-debian/any/ any main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list \
    && apt update \
    && DEBIAN_FRONTEND=noninteractive apt install helm -yq


# Install .env - https://plugins.jetbrains.com/plugin/9525--env-files
RUN bash /installer-scripts/plugin-installer.sh \
    -d /opt/WebStorm/plugins/ \
    9525 \
    # Install .ignore - https://plugins.jetbrains.com/plugin/7495--ignore
    && bash /installer-scripts/plugin-installer.sh \
    -d /opt/WebStorm/plugins/ \
    7495 \
    # Install google cloud code - https://plugins.jetbrains.com/plugin/8079-google-cloud-code
    && bash /installer-scripts/plugin-installer.sh \
    -d /opt/WebStorm/plugins/ \
    8079 \
    # Install Gemini Code Assist - https://plugins.jetbrains.com/plugin/24198-gemini-code-assist
    && bash /installer-scripts/plugin-installer.sh \
    -d /opt/WebStorm/plugins/ \
    24198 \
    # Install JetBrains AI Assistant - https://plugins.jetbrains.com/plugin/22282-jetbrains-ai-assistant
    && bash /installer-scripts/plugin-installer.sh \
    -d /opt/WebStorm/plugins/ \
    22282 \
    # Install JetBrains Junie - https://plugins.jetbrains.com/plugin/26104-jetbrains-junie
    && bash /installer-scripts/plugin-installer.sh \
    -d /opt/WebStorm/plugins/ \
    26104

COPY --from=code-oss-image /opt/code-oss /opt/code-oss
COPY --from=code-oss-image /etc/workstation-startup.d/110_start-code-oss.sh /etc/workstation-startup.d/110_start-code-oss.sh

COPY --from=astral/uv:0.9.8 /uv /uvx /bin/
COPY --from=oven/bun:1.3 /usr/local/bin/bun /bin/

RUN curl -fsSL https://bun.com/install | bash

COPY 011_customize_user.sh 120_install_vs_code_extensions.sh /etc/workstation-startup.d/
COPY customize_environment.sh /tmp/travelshift/customize_environment.sh
RUN chmod +x /etc/workstation-startup.d/011_customize_user.sh \
    && chmod +x /etc/workstation-startup.d/120_install_vs_code_extensions.sh \
    && chmod +x /tmp/travelshift/customize_environment.sh \
