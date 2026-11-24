#!/bin/zsh
# Renders the Ref still for each app state and stacks it under the app's own snapshot.
# Usage: tools/compare.sh <refdir> [name ...]   (refdir holds the app snapshots, see README)
set -e
cd ${0:A:h:h}
REF=${1:-/tmp}; shift || true
typeset -A props snaps
props=(recent '{"screen":"recent"}' empty '{"screen":"panel"}' sandra '{"screen":"panel","text":"sandra","state":"sandra"}'
       sel '{"screen":"panel","text":"sandra offerte","state":"offerte","selected":3}' list '{"screen":"results"}')
snaps=(recent vid-ref-0-recent empty vid-ref-2-empty sandra vid-ref-4-sandra sel vid-ref-6-sel list vid-ref-7-list)
names=(${@:-recent empty sandra sel list})
mkdir -p out/cmp
for n in $names; do
  npx remotion still Ref out/cmp/$n.png --props="${props[$n]}" --scale=2 --log=error
  magick $REF/${snaps[$n]}.png out/cmp/$n.png -compose difference -composite -level 0,25% -negate out/cmp/diff-$n.png
done
