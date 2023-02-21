#!/bin/bash
source $HOME/.bash_profile

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

git pull
pip3 install -r requirements.txt
python3 power-usage.py