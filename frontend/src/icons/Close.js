import React from 'react';

const Close = (props) => (
    <div className={`icon ${props.className || ''}`}>
        <svg version='1.1' id='Layer_1' x='0px' y='0px' viewBox='0 0 42 42' enableBackground='new 0 0 42 42'>
            <polygon points='36.5,7.5 34,5 20.5,18.5 7,5 4.5,7.5 18,21 4.5,34.5 7,37 20.5,23.5 34,37 36.5,34.5 23,21' />
        </svg>
    </div>
);

export default Close;
