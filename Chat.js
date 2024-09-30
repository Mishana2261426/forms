import React, { useState, useEffect, useRef } from 'react';
import { jwtDecode } from "jwt-decode";
import Header from '../Elements/Header';
import { Link } from 'react-router-dom';
import Get from '../Config/Get';
import Store from '../Store/Store';
import Config from '../Config/Config';
import ChatForm from '../Elements/ChatForm';
import ImageViewer from 'react-simple-image-viewer';
export const Chat = () => {
    let config = new Config();
    let chatref = useRef(null);
    var urlParams = new URLSearchParams(window.location.search);
    let chat_id = urlParams.get('id');
    let orderNumber = urlParams.get('order');
    orderNumber = orderNumber !== null ? '№ ' + orderNumber : '';
    const [user, setUser] = useState('');
    const [messages, setMessages] = useState([]);
    const [images, setImages] = useState([]);


    // Функция для воспроизведения звука уведомления

    const onSubmit = async (form) => {
        if (form.value.file !== '') {
            let data = await Get.post({
                fromUserId: user.user_id,
                type: "Image",
                content: form.value.file
            }, 'api/chats/' + chat_id + '/messages');

        }
        if (form.value.message !== '') {
            let data = await Get.post({
                fromUserId: user.user_id,
                type: "Text",
                content: form.value.message
            }, 'api/chats/' + chat_id + '/messages');

        }
    }
    const scroll = () => {
        setTimeout(function () {
            let element = document.getElementById('scrollBlock');

            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }

        }, 100);
    }
    const getMessages = async () => {
        let messages = await getChat();

        let images = [];
        if (messages.length > 0) {
            messages.map((el) => {
                if (el.type == 'Image') {
                    images.push(el.content);
                }
            });
        }
        setMessages(messages);
        scroll();

    }
    const getChat = async () => {
        let chat = null;
        let mess = [];
        if (Store.chat.data.length > 0) {
            Store.chat.data.map((el) => {
                if (el.chatId == chat_id && el.time > Date.now()) {
                    chat = el;
                }
            });
        }
        if (chat == null) {
            mess = await Get.get('api/chats/' + chat_id + '/messages');
            chat = {
                chatId: chat_id,
                data: mess.data,
                time: Date.now() * 60 * 60
            }
            Store.chat.time = Date.now() * 60 * 60;
            Store.chat.data.push(chat);
        }

        return chat.data;
    }
    const audio = new Audio('schelchek.mp3');
    useEffect(() => {
        audio.muted = true;
        audio.play();
    }, []);


    useEffect(() => {
        const { connectUser, events } = Get.socket()

        connectUser();

        const AddMessageToRequestApplicantChat = (chat_id) => {
            if (Store.chat.data.length > 0) {
                Store.chat.data.map((el, index) => {
                    if (el.chatId == chat_id) {
                        Store.chat.data[index].time = 0;
                    }
                });
            }

            audio.muted = false;
            audio.play();

            getMessages();
        };

        events(null, AddMessageToRequestApplicantChat, null, null);
    }, [])
    useEffect(() => {
        let tokenData = JSON.parse(localStorage.getItem('token'));
        let tokenDataDecode = {};
        let user = {};
        if (typeof tokenData == 'object') {
            tokenDataDecode = jwtDecode(tokenData.token);
            user.user_id = tokenDataDecode.user_id
        }
        setUser(user);
        getMessages();
    }, [])
    return (
        <div className='home-page menu-container'>
            <Header data={{ title: `Чат по заявке ${orderNumber}` }} nazad={true} />
            <div className='container'>
                <div className='pt-40'></div>
                <div className='pt-40'></div>
                {messages.map((el, index) => {
                    return (
                        <div key={index} className={`chat-message ${user.user_id !== el.user.userId ? 'from' : 'to'}`}>


                            <div className='message-block'>
                                <div className='chat-message-text flex-start'>
                                    <div className='user-block'>
                                        <div className='radius'>
                                            {el.user.name[0] + '' + el.user.name[1] + '' + el.user.name[2]}
                                        </div>
                                    </div>

                                    <div className='content'>
                                        {el.type == 'Image' ?
                                            <div className='image-block'>
                                                <img src={el.content} alt='Картинка' />
                                            </div>
                                            : ''}
                                        {el.type == 'Text' ?
                                            <div className='text-block'>
                                                {el.content}
                                            </div>
                                            : ''}
                                        <div className='chat-message-date'>{config.dateFormatTimestapTime(el.createdOn)}</div>
                                    </div>

                                </div>
                            </div>



                        </div>
                    )
                })}
                <div id='scrollBlock'></div>
            </div>

            <ChatForm ref={chatref} onSubmit={onSubmit} />
        </div>
    )
}
export default Chat;