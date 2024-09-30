import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
const QuestionForm = (props) => {
    let question = props.question;
    return (
        <form onSubmit={(e) => { props.submitForm(e) }}>
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

                <div className={"checkBox"}>
                    {question.answers.map((el, index) => {
                        return <div key={index}>
                            <input name='ansfer' id={`ansfer${index}`} defaultChecked={index == 0 ? true : false} type="radio" value={el.id} />
                            <label htmlFor={`ansfer${index}`}>{el.answer}</label>
                        </div>
                    })}

                </div>

                <div className={`marginTop`}>


                    <div className={"inputButton"} >
                        <Link to="/">
                            <img src={require('../../images/Frame.svg').default} alt="" />
                        </Link>
                        <input type="submit" value={'submit'} />
                    </div>


                    <div className={"enjoy"}>
                        <div
                            className={
                                "footerImgBackground firstQuestionResultContentFooter3 firstQuestionResultContentFooter5"
                            }>
                        </div>
                        <div className={"enjoyBlock1"}>enjoy to similar polls</div>
                        <div className={"hashtagsBlock"}>
                            <div>#covid</div>
                            <div>#medicine</div>
                            <div>#epidemy</div>
                        </div>
                        <Link to="/subscribedUserQuestion" className="enjoyBlock2">or create your own</Link>
                    </div>
                </div>
            </div>
        </form>
    )
}
export default QuestionForm;