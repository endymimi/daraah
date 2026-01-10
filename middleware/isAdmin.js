
const restrict = (admin)=>{
  return(req,res,next)=>{
    if(req.user.role !== admin){
        res.status(403).json({success:false, message:"You do not have permission to perform this action"});
       return 
    }
    next();
  }
}

export default restrict