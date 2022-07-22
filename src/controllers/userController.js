import bcrypt from "bcrypt";
import { token } from "morgan";
import fetch from "cross-fetch";
import User from "../models/User";
import { json } from "express";

export const getJoin = (req, res) => {
    res.render("join",{pageTitle: "Join"});
}
export const postJoin = async(req, res) => {
    const {name, email, password,password2, location} = req.body;
    const pageTitle="Join";
   
    if(password !== password2){
        return res.status(400).render("join", {
            pageTitle,
            errorMessage : "Password confirmation does not match.",
        }); 
    }
    
    const emailExists = await User.exists({email});
    if(emailExists){
        return res.status(400).render("join", {
            pageTitle,
            errorMessage : "This Email is already taken.",
        });
    }
    await User.create({
        name,
        email,
        password,
        location,
    });
    return res.redirect("/login");
    
}
export const getlogin = (req, res) => {
    
    return res.render("login", {pageTitle:"Login"});
};
export const postlogin = async(req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    const pageTitle = "Login";
    if(!user){
        return res.status(400).render("login", {
            pageTitle,
            errorMessage : "An email does not exists.",
        });
    }
    const ok = await bcrypt.compare(password, user.password);
    if(!ok){
        return res.status(400).render("login", {
            pageTitle,
            errorMessage : "Wrong password.",
        });
    }   
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
};
export const startGithubLogin = (req,res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id : process.env.GH_CLIENT,
        allow_signup : false,
        scope : "read:user user:email",
    };
    const param = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${param}`;
    return res.redirect(finalUrl);
};
export const finishGithubLogin = async(req,res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config={
        client_id : process.env.GH_CLIENT,
        client_secret : process.env.GH_SECRET,
        code:req.query.code,
    };
    const params= new URLSearchParams(config).toString();
    const finalUrl=`${baseUrl}?${params}`;
    const tokenRequest = await(
        await fetch(finalUrl, {
        method:"POST",
        headers:{
            Accept:"application/json",
        },
    })
    ).json();

    if ("access_token" in tokenRequest) {
        const {access_token}=tokenRequest;
        const apiUrl = "http://api.github.com"
        const userData = await(
        await fetch(`${apiUrl}/user` ,{
                headers: {
                    Authorization:`token ${access_token}`,
                },
            })
        ).json();
        
        const emailData = await (
            await fetch(`${apiUrl}/user/emails`,{
            headers:{
                Authorization: `token ${access_token}`,
            }
        })
        ).json();
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true
        );
        if(!emailObj) {
            return res.redirect("/login");
        }
        const existingUser = await User.findOne({email : emailObj.email});
        
        if (existingUser) {
            req.session.loggedIn = true;
            req.session.user = existingUser;
            return res.redirect("/")
        } else {
            const user = await User.create({
                
                name : userData.login,
                email:emailObj.email,
                socialOnly : true,
                password:"",
            })
        }
    } else {
        return res.redirect("/login");
    }
};

export const startKakaoLogin = (req,res) => {
    const baseUrl = `https://kauth.kakao.com/oauth/authorize`;
    const config = {
        client_id : process.env.REST_API_KEY,
        redirect_uri : "http://localhost:4000/users/kakao/finish",
        response_type : "code",
        
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    
    return res.redirect(finalUrl);
};

export const finishKakaoLogin = async(req,res) => {
    const baseUrl = "https://kauth.kakao.com/oauth/token";
    const config = {
        grant_type : "authorization_code" ,
        client_id: process.env.REST_API_KEY,
        redirect_uri: "http://localhost:4000/users/kakao/finish",
        code: req.query.code,
        
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await(
        await fetch(finalUrl, {
            method:"POST",
            
        })
        ).json();
        
        if ("access_token" in tokenRequest) {
            const apiUrl = "https://kapi.kakao.com";
            const {access_token} = tokenRequest;
            const userData = await(
                await fetch(`${apiUrl}/v2/user/me`, {
                    method : "POST",
                    headers:{
                    Authorization : `Bearer ${access_token}`,
                    
                },
            })).json();
            
            const kakaoProfile = userData.kakao_account.profile;
            
            const existingUser = await User.findOne({email : userData.kakao_account.email});
            
            if(existingUser){
                req.session.loggedIn = true;
                req.session.user = existingUser;
                return res.redirect("/");
                
            } else {
                const user = await User.create({
                name : kakaoProfile.nickname,
                email : userData.kakao_account.email,
                password:"",
                
                socialOnly : true,
                
            });
            
            req.session.loggedIn = true;
            req.session.user = user;
            return res.redirect("/");
        }
        
    }
    
};

export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
};

export const getEdit = (req, res) => {
    return res.render("edit-profile", {pageTitle:"Edit Profile"});
};
export const postEdit = async (req, res) => {
    const {
        session : {
            user : {_id, avatarUrl},
        },
        body: {name,location},
        file,
    } = req;
    const currentUser = req.session.user;
    
    /*  겹치는 유저 찾기
    if (nickname !== currentUser.nickname) {
        const alreadyExist = await User.exists({ nickname });
        if (alreadyExist) return res.status(400).redirect("/users/edit");
      }
      if (email !== currentUser.email) {
        const alreadyExist = await User.exists({ email });
        if (alreadyExist) return res.status(400).redirect("/users/eidt");
      } 
    */
   
    const updatedUser = await User.findByIdAndUpdate(_id, 
    {   
        avatarUrl: file ? file.path : avatarUrl,
        name, 
        location,
    },
    {new : true}
    );
    req.session.user = updatedUser;
    return res.redirect("/users/edit");
};

export const getChangePassword = (req,res) => {
    return res.render("change-password",{pageTitle : "Change Password"});
};
export const postChangePassword = async(req,res) => {
    const {
        session : {
            user : {_id},
        },
        body: {old, new1, new2},
       
    } = req;
    const user = await User.findById(_id);
    const ok = await bcrypt.compare(old, user.password);
    if(!ok){
        return res.status(400).render("change-password", {
            pageTitle:"Change Password",
            errorMessage: "이전 비밀번호와 일치하지 않습니다."
        });
    }

    if (new1 !== new2){
        return res.status(400).render("change-password", {
            pageTitle:"Change Password",
            errorMessage: "2차 비밀번호와 일치하지 않습니다."
        });
    }
    
    user.password = new1;
    await user.save();
    return res.redirect("/");
};
