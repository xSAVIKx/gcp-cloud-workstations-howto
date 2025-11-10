#!/usr/bin/env bash

sudo mkdir -p /home/user/.workstation/
sudo mkdir -p /home/user/.local/bin/
sudo cp /tmp/travelshift/customize_environment.sh /home/user/.workstation/customize_environment

sudo chown -R user /home/user/
sudo chmod +x /home/user/.workstation/customize_environment
