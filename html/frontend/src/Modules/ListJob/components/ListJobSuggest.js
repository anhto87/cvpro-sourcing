import React from 'react';
import PropTypes from 'prop-types';
import { Divider, Row, Typography } from 'antd';
import { FaBuysellads } from 'react-icons/fa';
const { Paragraph, Link } = Typography;

export const ListJobSuggest = ({ items, onPressLink }) => {
    return items.length > 0 ? (
        <div style={{ paddingTop: 41 }}>
            <div className='widthP100'>
                {items.map((job, index) => {
                    return (
                        <div key={index}>
                            <Link onClick={() => onPressLink(job)}>
                                <Link level={5} className='job-link'>
                                    {job?.jobTitle}
                                </Link>
                                <Row justify="start" align="middle" className="padB10">
                                    <FaBuysellads style={{ marginRight: 5 }} />
                                    <Link className="link-second">{job.domain}</Link>
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
    ) : <div />;
};


ListJobSuggest.propTypes = {
    items: PropTypes.any,
    onPressLink: PropTypes.func
};