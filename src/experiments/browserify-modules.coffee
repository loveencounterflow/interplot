

console.log '^4453-1^'
INTERTEXT 								= require 'intertext'
{ HYPH, }									= INTERTEXT
console.log '^4453-2^', INTERTEXT
console.log '^4453-3^', HYPH
console.log '^4453-4^', HYPH.reveal_hyphens HYPH.hyphenate "welcome to the world of InterText hyphenation!"

