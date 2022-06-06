<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class TaskList extends Model implements AuditableContract
{
    use Auditable;

    protected $table = 'taskLists';

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
        'init_disc_req',
        'init_disc_rcvd',
        'init_disc_notes',
        'wet_sig_req',
        'wet_sig_rcvd',
        'wet_sig_notes',
        'sales_contract_req',
        'sales_contract_rcvd',
        'sales_contract_notes',
        'two_yr_emp_hist_req',
        'two_yr_emp_hist_rcvd',
        'two_yr_emp_hist_na',
        'two_yr_emp_hist_notes',
        'award_letter_req',
        'award_letter_rcvd',
        'award_letter_na',
        'award_letter_notes',
        'cred_report_score',
        'cred_report_plan_rescore',
        'cred_report_notes',
        'verb_cred_auth_rcvd',
        'verb_cred_auth_notes',
        'cred_loe_req',
        'cred_loe_rcvd',
        'cred_loe_notes',
        'driv_lic_req',
        'driv_lic_rcvd',
        'driv_lic_notes',
        'pay_stub_req',
        'pay_stub_rcvd',
        'pay_stub_notes',
        'bank_stmnt_req',
        'bank_stmnt_rcvd',
        'bank_stmnt_notes',
        'tax_rtrn_req',
        'tax_rtrn_rcvd',
        'tax_rtrn_notes',
        'reo_docs_req',
        'reo_docs_rcvd',
        'reo_docs_na',
        'reo_docs_notes',
        'dd214_req',
        'dd214_rcvd',
        'dd214_na',
        'dd214_notes',
        'appraisal_ord',
        'appraisal_rcvd',
        'appraisal_disclosed',
        'appraisal_due_date',
        'appraisal_value',
        'appraisal_status',
        'appraisal_notes',
        'title_work_req',
        'title_work_rcvd',
        'title_work_notes',
        'survey_req_status',
        'survey_ord',
        'survey_rcvd',
        'survey_ord_due_date',
        'survey_notes',
        'hazard_ins_quote',
        'hazard_ins_bind_req',
        'hazard_ins_bind_rcvd',
        'hazard_ins_notes',
        'flood_cert_ord',
        'flood_cert_in_zone',
        'flood_cert_out_zone',
        'flood_cert_notes',
        'usps_req',
        'usps_rcvd',
        'usps_notes',
        'fha_case_num_req',
        'fha_case_num_rcvd',
        'fha_case_num_na',
        'fha_case_num_notes',
        'voe_curr_emp_req',
        'voe_curr_emp_rcvd',
        'voe_curr_emp_na',
        'voe_curr_emp_notes',
        'voe_prev_emp_req',
        'voe_prev_emp_rcvd',
        'voe_prev_emp_na',
        'voe_prev_emp_notes',
        'nmls_rcvd',
        'nmls_notes',
        'ss_val_req',
        'ss_val_rcvd',
        'ss_val_notes',
        'tax_trans_req',
        'tax_trans_rcvd',
        'tax_trans_notes',
        'w2_trans_req',
        'w2_trans_rcvd',
        'w2_trans_notes',
        'coe_trans_ord',
        'coe_trans_rcvd',
        'coe_trans_na',
        'coe_trans_notes',
        'run_aus_options',
        'run_aus_findings',
        'run_aus_notes'
    ];
}
