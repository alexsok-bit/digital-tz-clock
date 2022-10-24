#!/bin/sh
rsync -av --progress ../digital-tz-clock@sokol ~/.local/share/cinnamon/desklets/ --exclude .git --exclude deploy.sh
