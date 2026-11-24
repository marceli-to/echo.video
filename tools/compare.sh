#!/bin/zsh
# Renders the Ref still for each app state and stacks it under the app's own snapshot.
# Usage: tools/compare.sh <refdir> [name ...]   (refdir holds the app snapshots, see README)
set -e
cd ${0:A:h:h}
REF=${1:-/tmp}; shift || true
typeset -A props snaps
props=(recent '{"screen":"recent"}' empty '{"screen":"panel"}' sandra '{"screen":"panel","text":"sandra","state":"sandra"}'
       sel '{"screen":"panel","text":"sandra offerte","state":"offerte","selected":3}' list '{"screen":"results"}'
       p1 '{"screen":"people"}' p2 '{"screen":"people","feed":"meeting"}' p3 '{"screen":"people","feed":"chat"}'
       sources '{"screen":"settings","pane":"sources"}' agents '{"screen":"settings","pane":"agents"}')
snaps=(recent vid-ref-0-recent empty vid-ref-2-empty sandra vid-ref-4-sandra sel vid-ref-6-sel list vid-ref-7-list p1 vid-ref-p1 p2 vid-ref-p2 p3 vid-ref-p3 sources vid-ref-s-sources agents vid-ref-s-agents)
names=(${@:-recent empty sandra sel list})
mkdir -p out/cmp
for n in $names; do
  npx remotion still Ref out/cmp/$n.png --props="${props[$n]}" --scale=2 --log=error
  # Settings stills are smaller than the composition: cut them to the snapshot's size.
  magick out/cmp/$n.png -crop $(magick identify -format '%wx%h+0+0' $REF/${snaps[$n]}.png) +repage out/cmp/$n.png
done
