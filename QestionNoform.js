import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import WorldMap from "react-svg-worldmap";
const QuestionNoform = (props) => {
    let question = props.question;
    const [answers, setAswers] = useState([]);
    const [nametabs, setNametabs] = useState('all');
    const [map, setMap] = useState([]);
    const percentsList = () => {
        let data = {
            all: [],
            gender: {
                male: 0,
                female: 0,
                other: 0,
                all: []
            },
            ages: {
                age_0_23: 0,
                age_24_45: 0,
                age_46: 0,
                all: []
            },
            map: []
        }

        question.answers.map((el, index) => {
            data.all.push({
                answer: el.answer,
                total_percent: el.total_percent,

            });
            data.gender.male += el.hasOwnProperty('male') ? Number(el.male) : 0;
            data.gender.female += el.hasOwnProperty('female') ? Number(el.female) : 0;
            data.gender.other += el.hasOwnProperty('other') ? Number(el.other) : 0;
            data.ages.age_0_23 += el.hasOwnProperty('age_0_23') ? Number(el.age_0_23) : 0;
            data.ages.age_24_45 += el.hasOwnProperty('age_24_45') ? Number(el.age_24_45) : 0;
            data.ages.age_46 += el.hasOwnProperty('age_46') ? Number(el.age_46) : 0;
            if (el.hasOwnProperty('countries')) {
                let countres = Object.keys(el.countries);
                let golos = Object.values(el.countries);
                countres.map((el, index) => {
                    data.map.push({
                        country: el.toLowerCase().substr(0, 2),
                        value: golos[index]
                    })
                })
            }
        });

        let gendersAllPercent = (data.gender.male + data.gender.female + data.gender.other) / 100;
        data.gender.all = [
            { answer: 'Male', total_percent: Math.round(data.gender.male / gendersAllPercent) },
            { answer: 'Female', total_percent: Math.round(data.gender.female / gendersAllPercent) },
            { answer: 'Other', total_percent: Math.round(data.gender.other / gendersAllPercent) }
        ]
        let agesAllPercent = (data.ages.age_0_23 + data.ages.age_24_45 + data.ages.age_46) / 100;
        data.ages.all = [
            { answer: '0-23 years', total_percent: Math.round(data.ages.age_0_23 / agesAllPercent) },
            { answer: '24-45 years', total_percent: Math.round(data.ages.age_24_45 / agesAllPercent) },
            { answer: '46+ years', total_percent: Math.round(data.ages.age_46 / agesAllPercent) }
        ]
        let map = []
        data.map.map((el, index) => {

            let ind = map.findIndex((item) => item.country == el.country);
            if (ind == -1) {
                map.push(el)
            } else {
                map[ind].value += el.value
            }

        });

        data.map = map;
        return data
    }
    useEffect(() => {
        let data = percentsList();
        switch (nametabs) {
            case 'all':
                setAswers(data.all);
                break;
            case 'gender':
                setAswers(data.gender.all);
                break;
            case 'ages':
                setAswers(data.ages.all);
                break;
            case 'map':
                setMap(data.map);
                break;
            default:
                setAswers(data.all);
        }
    }, [nametabs])
    return (
        <div className={"main pageQuestion"}>
            <div className={"mainQuestion"}>{question.question_name}</div>

            <div className={"votesTimeFavorite"}>
                <div>
                    <img src={require('../../images/question.svg').default} alt="" />
                    <pre>{question.respondents} votes</pre>
                </div>
                <div>
                    <img src={require('../../images/time.svg').default} alt="" />
                    yesterday
                </div>
                <div>
                    <img src={require('../../images/favorite.svg').default} alt="" />
                    in favorites
                </div>
            </div>

            <hr />
            <div className="AfterQuestionGeneral">
                <div className="AfterQuestionGeneralImg">
                    {nametabs == 'all' ?
                        <img src={require('../../images/1.svg').default} alt="" /> :
                        <img src={require('../../images/diagram-o.svg').default} alt="" onClick={() => setNametabs('all')} />
                    }
                    {nametabs == 'gender' ?
                        <img src={require('../../images/gender_page.svg').default} alt="" /> :
                        <img src={require('../../images/gender.svg').default} alt="" onClick={() => setNametabs('gender')} />
                    }
                    {
                        nametabs == 'ages' ?
                            <img src={require('../../images/people_page.svg').default} alt="" /> :
                            <img src={require('../../images/people.svg').default} alt="" onClick={() => setNametabs('ages')} />
                    }
                    {
                        nametabs == 'map' ?
                            <img src={require('../../images/point_page.svg').default} alt="" /> :
                            <img src={require('../../images/point.svg').default} alt="" onClick={() => setNametabs('map')} />
                    }
                </div>
            </div>
            <div className='container'>
                <div className="AfterQuestionGeneralPercent">

                    {nametabs == 'map' ?
                        <div className="map">
                            <WorldMap
                                color="#6D98BB"
                                title="Countries"
                                value-suffix="people"
                                size="lg"
                                data={map}
                            />
                        </div>
                        :

                        answers.map((el, index) => {
                            return (
                                <div key={index} className="AfterQuestionGeneralPercentDiagram">
                                    <div className="progress-bar" style={{ width: el.total_percent + '%' }}>
                                        <div className='value-data'>
                                            {el.answer} - <b>{el.total_percent}%</b>
                                        </div>
                                    </div>
                                    <div className='value-data'>
                                        {el.answer} - <b>{el.total_percent}%</b>
                                    </div>
                                </div>
                            )
                        })

                    }
                </div>
            </div>
            <div className="footer">
                <div className="inputButton">
                    <Link to="/">
                        <img src={require('../../images/Frame.svg').default} alt="" />
                    </Link>
                    <input type="submit" value="share question" />
                </div>
                <div className="enjoy">
                    <div className="footerImgBackground firstQuestionResultContentFooter3 firstQuestionResultContentFooter5">
                    </div>
                    <div className="enjoyBlock1">enjoy to similar polls</div>
                    <div className="hashtagsBlock">
                        <div>#covid</div>
                        <div>#medicine</div>
                        <div>#epidemy</div>
                    </div>
                    <Link to="/subscribedUserQuestion" className="enjoyBlock2">or create your own</Link>
                </div>
            </div>
        </div>);
}
export default QuestionNoform;