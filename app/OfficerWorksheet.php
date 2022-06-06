<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class OfficerWorksheet extends Model implements AuditableContract
{
    use Auditable;

    protected $table = 'officerWorksheets';

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
        'prop_type_prim_res',
        'prop_type_invest_res',
        'prop_type_sec_home',
        'prop_type_detached',
        'prop_type_manufactured',
        'prop_type_condo',
        'prop_type_townhome',
        'sales_contract_req',
        'sales_contract_rcvd',
        'sales_contract_na',
        'wet_sig_req',
        'wet_sig_rcvd',
        'wet_sig_na',
        'init_disc_req',
        'init_disc_rcvd',
        'init_disc_na',
        'bankruptcy_hist',
        'verb_cred_auth',
        'foreclosure_hist',
        'cred_loe_req',
        'cred_loe_rcvd',
        'cred_loe_na',
        'child_sup_req',
        'child_sup_rcvd',
        'child_sup_na',
        'divorce_decree_req',
        'divorce_decree_rcvd',
        'divorce_decree_na',
        'other_props',
        'other_props_intent',
        'two_yr_emp_hist_req',
        'two_yr_emp_hist_rcvd',
        'two_yr_emp_hist_na',
        'income',
        'c2c_check',
        'c2c_check_stmnt_req',
        'c2c_check_stmnt_rcvd',
        'c2c_check_stmnt_na',
        'c2c_gift',
        'c2c_gift_equity',
        'c2c_gift_letter_req',
        'c2c_gift_letter_rcvd',
        'c2c_gift_letter_na',
        'c2c_gift_check_req',
        'c2c_gift_check_rcvd',
        'c2c_gift_check_na',
        'c2c_gift_donor_req',
        'c2c_gift_donor_rcvd',
        'c2c_gift_donor_na',
        'c2c_gift_borrower_req',
        'c2c_gift_borrower_rcvd',
        'c2c_gift_borrower_na',
        'c2c_dpa',
        'c2c_dpa_program',
        'c2c_dpa_pack_sent',
        'c2c_2nd_lien',
        'c2c_2nd_lien_details',
        'locked_le_req',
        'locked_le_rcvd',
        'locked_le_na',
        'closing_disc_req',
        'closing_disc_rcvd',
        'closing_disc_na',
        'run_aus_options',
        'run_aus_findings',
        'dd214_req',
        'dd214_rcvd',
        'nps_req',
        'nps_rcvd',
        'nps_na',
        'debts'
    ];
}
