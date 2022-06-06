import React, { Component } from 'react';
import { Select, Tooltip, message } from 'antd';
const Option = Select.Option;
var moment = require('moment');

export default class DisplayTooltip extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let procWorksheet, noData, appTitle, appOrd, appRec, appDue, appValue,
            appStatus, appExtraStartSpace, appLineBreak, finalTitle, finalRec,
            finalOrd, finalDue, finalExtraStartSpace, finalLineBreak, survTitle,
            survReq, survOrd, survRec, survDue, survExtraStartSpace, survLineBreak,
            titleWorkTitle, titleReq, titleRec, titleExtraStartSpace, titleLineBreak,
            hazTitle, hazQuoteReq, hazQuoteRec, hazQuoteSent, hazReq, hazRec, hazEffDate,
            hazExtraStartSpace;

        const procWorksheetData = this.props.data;
        const row = this.props.row;

        procWorksheetData.forEach(function(outerArr) {
            outerArr.forEach(function(item) {
                if(item.loan_id === row.id) {
                    procWorksheet = item;
                }
            });
        });

        if (procWorksheet.appraisal_rcvd === 1) {
            appRec = ' Received: Yes';

            if (procWorksheet.appraisal_value === null) {
                appValue = ' | Value: Not Entered';
            } else {
                appValue = ' | Value: ' + procWorksheet.appraisal_value;
            }

            if (procWorksheet.appraisal_status === 'sub to') {
                appStatus = ' | Status: sub to';

                if (procWorksheet.final_rcvd === 1) {
                    finalRec = ' Received: Yes';
                } else if (procWorksheet.final_ord === 1) {
                    finalOrd = ' Ordered on ' + moment(procWorksheet.final_ord_date, "YYYY-MM-DD").format("MM/DD/YYYY");

                    if (procWorksheet.final_due_date === null) {
                        finalDue = ' | Due Date: Not Entered';
                    } else {
                        finalDue = ' | Due Date ' + moment(procWorksheet.final_due_date, "YYYY-MM-DD").format("MM/DD/YYYY");
                    }
                } else {
                    finalOrd = ' Not Ordered.'
                }
            } else if (procWorksheet.appraisal_status === 'as is') {
                appStatus = ' | Status: as is';
            }
        } else {
            if (procWorksheet.appraisal_ord === 1) {
                appOrd = ' Ordered on ' + moment(procWorksheet.appraisal_ord_date, "YYYY-MM-DD").format("MM/DD/YYYY");

                if (procWorksheet.appraisal_due_date === null) {
                    appDue = ' | Due Date: Not Entered';
                } else {
                    appDue = ' | Due Date: ' + moment(procWorksheet.appraisal_due_date, "YYYY-MM-DD").format("MM/DD/YYYY");
                }
            }
        }

        if (appOrd || appRec) {
            appTitle = <strong>Appraisal<br/></strong>;
            appExtraStartSpace = '\xa0\xa0\xa0\xa0';
            appLineBreak = <br />;
        }

        if (finalRec || finalOrd) {
            finalTitle = <strong>Final Inspection<br/></strong>;
            finalExtraStartSpace = '\xa0\xa0\xa0\xa0';
            finalLineBreak = <br />;
        }

        if (procWorksheet.survey_rcvd === 1) {
            survRec = ' Received: Yes';
        } else if (procWorksheet.survey_ord === 1) {
            survOrd = ' Ordered on ' + moment(procWorksheet.survey_ord_date, "YYYY-MM-DD").format("MM/DD/YYYY");

            if (procWorksheet.survey_ord_due_date === null) {
                survDue = ' | Due Date: Not Entered';
            } else {
                survDue = ' | Due Date: ' + moment(procWorksheet.survey_ord_due_date, "YYYY-MM-DD").format("MM/DD/YYYY");
            }
        } else if (procWorksheet.survey_req === 1) {
            survReq = ' Request Status: Yes';
        }

        if (survReq || survOrd || survRec) {
            survTitle = <strong>Survey<br /></strong>;
            survExtraStartSpace = '\xa0\xa0\xa0\xa0';
            survLineBreak = <br />;
        }

        if (procWorksheet.title_work_rcvd === 1) {
            titleRec = ' Received: Yes';
        } else if (procWorksheet.title_work_req === 1) {
            titleReq = ' Requested on ' + moment(procWorksheet.title_work_req_date, "YYYY-MM-DD").format("MM/DD/YYYY");
        }

        if (titleReq || titleRec) {
            titleWorkTitle = <strong>Title Work<br /></strong>;
            titleExtraStartSpace = '\xa0\xa0\xa0\xa0';
            titleLineBreak = <br />;
        }

        if (procWorksheet.haz_ins_binder_rcvd === 1) {
            hazRec = 'Binder Received';

            if (procWorksheet.haz_ins_binder_date === null) {
                hazEffDate = ' | Effective Date: Not Entered';
            } else {
                hazEffDate = ' | Effective Date: ' + moment(procWorksheet.haz_ins_binder_date, "YYYY-MM-DD").format("MM/DD/YYYY");
            }
        } else if (procWorksheet.haz_ins_binder_req === 1) {
            hazReq = ' Binder Requested on ' +  moment(procWorksheet.haz_ins_binder_req_date, "YYYY-MM-DD").format("MM/DD/YYYY");
        } else if (procWorksheet.haz_ins_quote_sent === 1) {
            hazQuoteSent = ' Quote Sent on ' + moment(procWorksheet.haz_ins_quote_sent_date, "YYYY-MM-DD").format("MM/DD/YYYY");
        } else if (procWorksheet.haz_ins_quote_rcvd === 1) {
            hazQuoteRec = ' Quote Received';
        } else if (procWorksheet.haz_ins_quote_req === 1) {
            hazQuoteReq = ' Quote Requested on ' + moment(procWorksheet.haz_ins_quote_req_date, "YYYY-MM-DD").format("MM/DD/YYYY");
        }

        if (hazRec || hazReq || hazQuoteSent || hazQuoteRec || hazQuoteReq) {
            hazTitle = <strong>Hazard Insurance<br /></strong>;
            hazExtraStartSpace = '\xa0\xa0\xa0\xa0';
        }

        if (!appTitle && !survTitle && !titleWorkTitle && !hazTitle) {
            noData = 'No Data Entered';
        }

        const text =
            <span>
                {noData}
                {appTitle}
                {appExtraStartSpace}{appRec}{appValue}{appStatus}{appOrd}{appDue}
                {appLineBreak}
                {finalTitle}
                {finalExtraStartSpace}{finalRec}{finalOrd}{finalDue}
                {finalLineBreak}
                {survTitle}
                {survExtraStartSpace}{survRec}{survOrd}{survDue}{survReq}
                {survLineBreak}
                {titleWorkTitle}
                {titleExtraStartSpace}{titleRec}{titleReq}
                {titleLineBreak}
                {hazTitle}
                {hazExtraStartSpace}{hazRec}{hazEffDate}{hazReq}{hazQuoteSent}{hazQuoteRec}{hazQuoteReq}
            </span>;

        return (
            <Tooltip placement="right" title={text}>{this.props.cell}</Tooltip>
        );
    }
}
