<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class Borrower extends Model implements AuditableContract
{
    use Auditable;

    protected $table = 'borrowers';

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
        'cred_report_score',
        'cred_report_number',
        'cred_report_plan_res',
        'driv_license_req',
        'driv_license_rcvd',
        'driv_license_na',
        'pay_stub_req',
        'pay_stub_rcvd',
        'pay_stub_na',
        'tax_return_req',
        'tax_return_rcvd',
        'tax_return_na',
        'award_letter_req',
        'award_letter_rcvd',
        'award_letter_na',
        'voe_curr_emp_req',
        'voe_curr_emp_rcvd',
        'voe_prev_emp_req',
        'voe_prev_emp_rcvd',
        'ss_val_req',
        'ss_val_rcvd',
        'tax_trans_ord',
        'tax_trans_rcvd',
        'tax_trans_na',
        'w2_trans_ord',
        'w2_trans_rcvd',
        'w2_trans_na'
    ];
}
