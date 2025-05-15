const mongoose=require("mongoose")
const plm=require('passport-local-mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/pin");

const userSchema=mongoose.Schema({
    
    username:{
        type:String,
        required:true,
        trim:true,
        minLength:[3,'username must be atleast 3 characters'],
        lowercase:true
    },
    password:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        minLength:[5,'email must be atleast 5 characters'],
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        minLength:[5,'email must be atleast 5 characters'],
        lowercase:true
    },
    profileImage:{
        type:String
    },
    boards:{
        type:Array,
        default:[]
    },
    posts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"post"
        }
    ]
})

userSchema.plugin(plm);

module.exports=mongoose.model("user",userSchema)