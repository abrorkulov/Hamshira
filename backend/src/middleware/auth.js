const jwt = require('jsonwebtoken');
module.exports = function requireAuth(req,res,next){
 const h=req.get('authorization')||'';const token=h.startsWith('Bearer ')?h.slice(7):null;
 if(!token)return res.status(401).json({error:'Kirish talab qilinadi.'});
 try{req.user=jwt.verify(token,process.env.JWT_SECRET);next();}
 catch{return res.status(401).json({error:'Token yaroqsiz yoki muddati tugagan.'});}
};
