const express=require('express')
const router=express.Router()
const userModel=require('./users')
const postModel=require('./post')
const passport = require('passport')
const bcrypt=require('bcrypt')
const {body, validationResult } = require('express-validator')
const jwt=require('jsonwebtoken')
const upload=require('./multer')
const { token } = require('morgan')
const cookieParser=require('cookie-parser')

router.use(express.json())
router.use(express.urlencoded({extended:true}))
router.use(cookieParser())

function isLoggedIn(req, res, next) {
    const token = req.cookies.token; // Access the token from cookies
    if (!token) {
        return res.redirect('/login'); // Redirect to login if no token is found
    }

    try {
        const loggedinUserdata = jwt.verify(token, 'hey hey'); // Verify the token
        req.user = loggedinUserdata; // Attach the decoded user data to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.error("Token verification failed:", err.message);
        return res.redirect('/login'); // Redirect to login if token verification fails
    }
}

router.get('/login',(req,res)=>{
    res.render('index',{nav:false})
})

router.get('/',(req,res)=>{
    res.render('register',{nav:false})
})

router.post('/register', 
    body('email').trim().isEmail(),
    body('password').trim().isLength({min:5}),
    body('username').trim().isLength({min:3}),
    async (req,res)=>{
        const errors=validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({
                errors:errors.array(),
                message:"registration failed"
            })
        }else{
        const {email,password,username}=req.body;
        const hashpassword=await bcrypt.hash(password,10)
        const newuser=await userModel.create({
            username:username,
            password:hashpassword,
            email:email
        });
        res.redirect("login")
        }
})

router.post('/login',
    body('username').trim().isLength({min:3}),
    body('password').trim().isLength({min:5}),
    async (req,res)=>{

        const errors=validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({
                errors:errors.array(),
                message:"Invalid credentials"
            })
        }else{
            const {username,password}=req.body;
            const user=await userModel.findOne({
                username:username
            });

            if(!user){
                return res.status(400).json({
                    message:'username  is incorrect'
                })
            }else{
                const isMatch=await bcrypt.compare(password,user.password)
        
                if(!isMatch){
                    return res.status(400).json({
                        message:'password is incorrect'
                    })
                }else{
                    const token=jwt.sign({
                        id:user._id,
                        username:user.username,
                        email:user.email
                    },'hey hey',{expiresIn:'1h'});
                    res.cookie('token',token)
                    res.redirect('/profile')
            }
        }
    }    
})

router.get('/profile',isLoggedIn,async (req,res)=>{
    const userData=jwt.verify(req.cookies.token,'hey hey')
    const user=await userModel.findOne({username:userData.username}).populate('posts')
    res.render("profile",{user,nav:true})
})

router.get('/logout', (req, res) => {
    res.clearCookie('token'); 
    res.redirect('/login'); 
});

router.post('/file-upload',isLoggedIn,upload.single("image"),async (req,res)=>{
    const userData=jwt.verify(req.cookies.token,'hey hey')
    const user=await userModel.findOne({username:userData.username})
    user.profileImage=req.file.filename
    await user.save()
    res.redirect('/profile')
})

router.get('/add',isLoggedIn,async (req,res)=>{
    const userData=jwt.verify(req.cookies.token,'hey hey')
    const user=await userModel.findOne({username:userData.username})
    res.render("add",{user,nav:true})
})

router.post('/createpost', isLoggedIn, upload.single('postimage'), async (req, res) => {
    const userData = jwt.verify(req.cookies.token, 'hey hey');
    const user = await userModel.findOne({ username: userData.username });

    const post = await postModel.create({
        user: user._id,
        title: req.body.title,
        description: req.body.description,
        image: req.file.filename
    });

    user.posts.push(post._id);
    await user.save();
    res.redirect('/profile');
});


router.get('/posts',isLoggedIn,async(req,res)=>{
    const userData = jwt.verify(req.cookies.token, 'hey hey');
    const user = await userModel.findOne({ username: userData.username }).populate('posts');


    res.render("posts",{user,nav:true})
})


router.get('/posts/:id', isLoggedIn, async (req, res) => {
    const postId = req.params.id; 
    const post = await postModel.findById(postId); 

    const userData = jwt.verify(req.cookies.token, 'hey hey');
    const user = await userModel.findOne({ username: userData.username })

    if (!post) {
        return res.status(404).send("Post not found"); 
    }

    res.render("indPost", { post, nav: true }); 
});


router.get('/feed',isLoggedIn,async (req,res)=>{
    const userData = jwt.verify(req.cookies.token, 'hey hey');
    const user = await userModel.findOne({ username: userData.username })

    const posts=await postModel.find().populate('user')

    res.render("feed",{posts,user,nav:true})

})




module.exports=router
