const Chat = require('../models/Chat');
const User = require('../models/User');

const accessChat = async(req, res) => {
    const {userId} = req.body;

    if(!userId) {
        return res.status(400).json({
            message: "UserId param not sent",
        });
    }
    let chat = await Chat.find({isGroupChat: false, $and: [{users: {$elemMatch: {$eq: req.user._id}}}, 
        {users: {$elemMatch: {$eq: userId}}},],})
        .populate("users", "-password")
        .populate("latestMessage");

        chat = await User.populate(chat, {
            path: "latestMessage.sender",
            select: "name email avatar",
        });

        if(chat.length > 0) {
            res.send(chat[0]);
        } else{
            const chatData = {chatName: "sender",isGroupChat: false, users: [req.user._id, userId],};

            try{
                const createdChat = await Chat.create(chatData);
                const fullChat = await Chat.findById(createdChat._id)
                .populate("users", "-password");
                res.status(201).json(fullChat);
            }catch(error) {
                res.status(400);

                throw new Error(error.message);
            }
        }
    };
const fetchChats = async(req, res) => {
    try{
        let chats = await Chat.find({
            users: {$elemMatch: {$eq: req.user._id}},
        })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")

        .sort({updatedAt: -1});

        chats = await User.populate(chats, {
            path: "latestMessage.sender",
            select: "name email avatar"
        });
        res.status(200).json(chats);

    }catch(error) {
        res.status(400);

        throw new Error(error.message);
    }
}; 

const createGroupChat = async(req, res) => {
    const {users, name} = req.body;
    const parsedUsers = JSON.parse(users);

    if(parsedUsers.length < 2) {
        return res.status(400).json({
            message: "At least 2 users required",
        });
    }
    parsedUsers.push(req.user);
    try{
        const groupChat = await Chat.create({
            chatName: name,
            users: parsedUsers,
            isGroupChat: true,
            groupAdmin: req.user
        });

        const fullGroupChat = await Chat.findById(groupChat._id)
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
        res.status(201).json({fullGroupChat});
    }catch(error){
        res.status(400);

        throw new Error(error.message);
    }
};
module.exports = {accessChat, fetchChats, createGroupChat };


