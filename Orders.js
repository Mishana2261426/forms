import React, { useState, useEffect, useRef } from 'react';

import Header from '../Elements/Header';
import { Link } from 'react-router-dom';
import Get from '../Config/Get';
import Menu from '../Elements/Menu';
import Store from '../Store/Store';
import Config from '../Config/Config';

import { jwtDecode } from "jwt-decode";
import ModalAddOrder1 from '../Elements/ModalAddOrder1';
import ModalNoSchet from '../Elements/ModalNoSchet';
export const Orders = () => {
    const modNoschet = useRef(null);
    const modal1 = useRef(null);
    const [shects, setShets] = useState([]);
    let config = new Config();


    let tokenData = JSON.parse(localStorage.getItem('token'));

    let tokenDataDecode = {};
    if (typeof tokenData == 'object') {
        tokenDataDecode = jwtDecode(tokenData.token);

    }
    const [status, setStatus] = useState('active');

    const [orders, setOrders] = useState([])
    const getCompleteStatus = async () => {
        let res = await Get.get('api/statuses?type=Normal');
        if (res.hasOwnProperty('data') && Array.isArray(res.data)) {
            let completeStatus = res.data.filter(item => item.name === 'Выполнено')[0];
            return completeStatus.statusId;
        }
        return false;
    }
    const OrderComplete = async (order) => {
        let statusID = await getCompleteStatus();
        if (statusID) {
            console.log(statusID);
            let data = await Get.patch({
                description: order.description,
                phoneNumber: order.phoneNumber,
                contactPerson: order.contactPerson,
                appealCategoryId: order.appealCategoryId,
                appealTypeId: order.appealTypeId,
                areaRoomId: order.areaRoomId,
                personalAccountId: order.personalAccountId,
                statusId: statusID,
            }, 'api/requests/' + order.requestId);
            if (data.type == 'success') {
                Store.orders.time = 0;
                getOrders();
            }
        }
    }
    const setCompany = async (schet) => {
        let tokenData = JSON.parse(localStorage.getItem('token'));


        let token = await Get.post({
            "personalAccountId": schet,
            "refreshToken": tokenData.refreshToken
        }, 'api/identity/token/refresh');
        localStorage.setItem('token', JSON.stringify(token));

        Store.orders.time = 0;
        getOrders();
        ConnectSocket();
    }
    const ConnectSocket = async () => {
        const { connectUser, events, reConnect } = Get.socket();
        reConnect();


        const handleStatusChanged = () => {
            Store.orders.time = 0;
            getOrders();

        };

        events(handleStatusChanged, null, null, null);
    }
    const getPhoneToken = async () => {
        let phonetoken = localStorage.getItem('phonetoken');
        if (phonetoken !== null) {
            if (Store.phonetoken.time < Date.now() * 60 * 60 * 24 || Store.phonetoken.data == null) {
                Get.put({ 'firebaseToken': phonetoken }, 'api/account/sessions/firebase');

                Store.phonetoken.data = phonetoken;
                Store.phonetoken.time = Date.now() * 60 * 60 * 24;
            }
        }

    }

    const getOrders = async () => {

        if (Store.orders.time < Date.now()) {
            let tokenData = JSON.parse(localStorage.getItem('token'));
            tokenDataDecode = jwtDecode(tokenData.token);
            // console.log(tokenDataDecode.user_id);
            let data = await Get.get('api/requests?userId=' + tokenDataDecode.user_id);

            if (Array.isArray(data.data)) {
                Store.orders.data = data.data;
                Store.orders.time = Date.now() * 60 * 60;
            } else {
                Store.orders.data = [];
            }


        }
        setOrders(Store.orders.data);

    }
    const openModal1 = () => {
        if (shects.length > 0) {
            modal1.current.modaOpen();
        } else {
            ModalNoSchetOpen();
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
    const getSchets = async () => {
        let data = [];
        if (Store.schets.time < Date.now()) {
            data = await Get.get('api/personal-accounts');
            if (data.status !== 404) {
                for (let i = 0; i < data.data.length; i++) {
                    if (data.data[i].account == '0000000000000000') {
                        data.data.splice(i, 1);
                    }
                }
                if (Array.isArray(data.data)) {
                    Store.schets.data = data.data;
                    Store.schets.time = Date.now() * 60 * 60 * 24 * 7;
                } else {
                    Store.schets.data = [];
                }
            }
        }
        setShets(Store.schets.data);
        if (Store.schets.data.length == 0) {
            ModalNoSchetOpen();
        }
    }
    const ModalNoSchetOpen = () => {
        if (modNoschet.current !== null) {
            modNoschet.current.modaOpen();
        }

    }
    useEffect(() => {
        ConnectSocket();
    }, [])
    useEffect(() => {
        getOrders();
        getSchets();
        getPhoneToken();
    }, [])
    return (
        <>
            <div className='orders-page menu-container'>
                <Header data={{ title: 'Заявки' }} />

                <div className='tab-links-wrap pt-20'>
                    <div className='container'>
                        <ul className='tab-links flex-betwen'>
                            <li>
                                <Link className="active" to='/orders'>Заявки</Link>
                            </li>
                            <li>
                                <Link to='/services'>Услуги</Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className='container pt-20'>
                    <div className='btns-container-status flex-start'>
                        <button type='button' className={`btn ${status == 'active' ? 'btn-orange' : 'btn-shadof'}`} onClick={() => setStatus('active')}>Активные</button>
                        <button type='button' className={`btn ${status == 'complete' ? 'btn-orange' : 'btn-shadof'}`} onClick={() => setStatus('complete')}>Выполненные</button>
                    </div>
                </div>
                <div className='container pt-40'>

                    <div className='input-block focus'>

                        <select onChange={(e) => { setCompany(e.target.value) }}>
                            {shects.map(

                                (el, index) => {

                                    return (
                                        <option selected={tokenDataDecode.managingOrganizationId == el.managingOrganizationId ? true : false} key={index} value={el.personalAccountId}>{el.account}</option>
                                    )
                                }
                            )}
                        </select>
                        <label>Выберите счет</label>
                    </div>
                </div>
                <div className='order-container container'>

                    {orders.length > 0 ? orders.map((el, index) => {

                        if (status == 'active' && el.status.name !== 'Выполнено') {
                            return (
                                <div className='order-item' key={index}>

                                    <Link to={`/order?id=${el.requestId}`} key={index} className='order-item-link'>
                                        <div className='flex-start flex-wrap'>
                                            <div className='title'>Заявка № {el.requestNumber}</div>

                                            <div className='date'>{config.dateFormatTimestapTime(el.createdOn)}</div>
                                        </div>
                                        <div className='pt-10'></div>
                                        <div className='status-block'>
                                            <div className='status-container' style={{ background: el.status.color }}>
                                                <div className='status flex-start'>
                                                    <img src={el.status.icon} />
                                                    <div className='status-title'>{el.status.name}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='pt-15'></div>
                                        <div className='hr'></div>
                                        <div className='title-bilding'>
                                            {el.appealType.name}
                                        </div>
                                        <div className='pt-15'></div>
                                        <div className='message'>
                                            {el.description}
                                        </div>

                                    </Link>
                                    {/* <Link to={`/chat?order=${el.requestId}`} className='chat-link'></Link> */}
                                    {el.status.name == 'Ожидает подтверждения' ? <div className='pt-10 input-block'><button type='buttom' className='btn btn-green' onClick={() => { OrderComplete(el) }}>Подтвердить выполнение</button></div> : ''}
                                </div>
                            );
                        }
                        if (status == 'complete' && el.status.name == 'Выполнено') {
                            return (
                                <div className='order-item' key={index}>

                                    <Link to={`/order?id=${el.requestId}`} key={index} className='order-item-link'>
                                        <div className='flex-start flex-wrap'>
                                            <div className='title'>Заявка № {el.requestNumber}</div>

                                            <div className='date'>{config.dateFormatTimestapTime(el.createdOn)}</div>
                                        </div>
                                        <div className='pt-10'></div>
                                        <div className='status-block'>
                                            <div className='status-container' style={{ background: el.status.color }}>
                                                <div className='status flex-start'>
                                                    <img src={el.status.icon} />
                                                    <div className='status-title'>{el.status.name}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='pt-15'></div>
                                        <div className='hr'></div>
                                        <div className='title-bilding'>
                                            {el.appealCategory.name}
                                        </div>
                                        <div className='pt-15'></div>
                                        <div className='message'>
                                            {el.description}
                                        </div>
                                    </Link>
                                </div>
                            );
                        }



                    }) : <div className='no-orders-container container'><div className="text-alert">Здесь будут отображаться ваши заявки и услуги. Вы можете создать их здесь</div></div>}
                </div>
                <Menu link='/orders' />

            </div>
            <ModalAddOrder1 ref={modal1} getOrders={() => { getOrders() }} />
            <div className='plus-orders' onClick={() => openModal1()}></div>
            <ModalNoSchet ref={modNoschet} />
        </>
    )
}
export default Orders;