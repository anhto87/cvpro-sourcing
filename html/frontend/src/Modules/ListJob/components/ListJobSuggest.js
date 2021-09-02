import React from 'react';
import PropTypes from 'prop-types';
import { Divider, Row, Typography } from 'antd';
import { FaBuysellads } from 'react-icons/fa';
const { Paragraph, Link } = Typography;

export const ListJobSuggest = ({ items, onPressLink }) => {
    return items.length > 0 ? (
        <div style={{ width: 350, paddingTop: 150, paddingLeft: 40, paddingRight: 20 }}>
            <div className='widthP100'>
                {items.map((job, index) => {
                    return (
                        <div key={index}>
                            <Link onClick={() => onPressLink(job)}>
                                <Link level={5}
                                    className='job-link'
                                    onClick={() => onPressLink(job)}
                                >
                                    {job?.jobTitle}
                                </Link>
                                <Row justify="start" align="middle" className="padB10">
                                    <FaBuysellads style={{ marginRight: 5 }} />
                                    <a className="link-second">{job.domain}</a>
                                </Row>
                                <Paragraph className='fontW400' ellipsis={{ expandable: false, rows: 3 }}>
                                    {job?.jobDescription}
                                </Paragraph>
                                <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    ) : null;
};


ListJobSuggest.propTypes = {
    items: PropTypes.any,
    onPressLink: PropTypes.func
};