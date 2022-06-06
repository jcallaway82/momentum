<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class ProcessorWorksheet extends Model implements AuditableContract
{
    use Auditable;

    protected $table = 'processorWorksheets';

    public function loan()
    {
        return $this->belongsTo('App\Loan');
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'title_work_req',
        'title_work_req_date',
        'title_work_rcvd',
        'title_work_rcvd_comm',
        'title_work_rcvd_cpl',
        'title_work_rcvd_title',
        'title_work_rcvd_tax',
        'title_work_rcvd_eo',
        'title_work_rcvd_wiring',
        'title_work_rcvd_prelim',
        'title_work_na',
        'survey_req',
        'survey_ord',
        'survey_ord_date',
        'survey_ord_due_date',
        'survey_rcvd',
        'survey_expense',
        'haz_ins_quote_req',
        'haz_ins_quote_req_date',
        'haz_ins_quote_rcvd',
        'haz_ins_quote_sent',
        'haz_ins_quote_sent_date',
        'haz_ins_quote_na',
        'haz_ins_binder_req',
        'haz_ins_binder_req_date',
        'haz_ins_binder_rcvd',
        'haz_ins_binder_date',
        'appraisal_ord',
        'appraisal_ord_date',
        'appraisal_due_date',
        'appraisal_paid',
        'appraisal_rcvd',
        'appraisal_value',
        'appraisal_status',
        'appraisal_disclosed',
        'final_na',
        'final_ord',
        'final_ord_date',
        'final_due_date',
        'final_paid_poc',
        'final_paid_pac',
        'final_rcvd',
        'voe_curr_emp_na',
        'voe_prev_emp_na',
        'fraudguard_run',
        'fraudguard_cleared',
        'fha_case_num_ord',
        'fha_case_num_val',
        'fha_case_num_trans',
        'usps',
        'nmls',
        'flood_cert_in_zone',
        'flood_cert_out_zone',
        'coe_trans_req',
        'coe_trans_rcvd',
        'nov_req',
        'nov_rcvd',
        'tx_cash_req',
        'tx_cash_rcvd',
        'tx_cash_na',
        'mort_payoff_req',
        'mort_payoff_rcvd',
        'mort_payoff_na',
        'res_income_comp',
        'res_income_na'
    ];
}
