
sudo apt install xorg-dev libx11-dev
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt install nodejs
mkdir /data/code/pandora/medusa
cd /data/code/pandora/medusa
npm config set registry https://registry.npm.taobao.org
npm init
ELECTRON_MIRROR="https://npm.taobao.org/mirrors/electron/" npm install electron
npm install robotjs
npm rebuild --runtime=electron --target=2.0.2 --disturl=https://atom.io/download/atom-shell --abi=57
