const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title:{type:String,required:true},
    body:{type:String,required:true},
    createdBy:{type: mongoose.Schema.Types.ObjectId,required:true,ref:'User'},
    active:{type:Boolean,default:true}
})

const Post = mongoose.model('Post',PostSchema);

module.exports = Post;