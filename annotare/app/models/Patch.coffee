Spine = require('spine')
Relation = require('lib/relation')
diff_match_patch = require('lib/diff_match_patch')

class Patch extends Spine.Model
  @configure 'Patch', 'patch', 'time'
  
  # Persist with Local Storage
  @extend @Local
  
  @belongsTo 'document', 'models/Document'
  
  # Apply this patch to the given text
  apply: (base) =>
    differ = new diff_match_patch()
    patches = differ.patch_fromText(@patch)
    return differ.patch_apply(patches, base)[0]
  
module.exports = Patch