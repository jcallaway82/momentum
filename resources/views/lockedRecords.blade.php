@extends('layouts.app')

@section('title', '| Locked Records')

@section('content')

    <div class="col-lg-10 col-lg-offset-1">
        <h1><i class="fa fa-key"></i> Locked Records</h1>

        <div class="table-responsive">
            <table class="table table-bordered table-striped">

                <thead>
                <tr>
                    <th>Worksheet</th>
                    <th>Record</th>
                    <th>Locked Time</th>
                    <th>Locked By</th>
                    <th>Operation</th>
                </tr>
                </thead>
                <tbody>
                @foreach ($records as $record)
                    <tr>
                        @if ($record->tableName == 'officerWorksheets')
                            <td>Loan Officer</td>
                        @elseif ($record->tableName == 'processorWorksheets')
                            <td>Processor</td>
                        @endif
                        <td>{{ $record->borrower_name }}</td>
                        <td>{{ date('m-d-Y g:ia', strtotime($record->lockDateTime)) }}</td>
                        <td>{{ $record->lockUser }}</td>
                        <td>
                            {!! Form::open(['method' => 'DELETE', 'route' => ['unlockRecord', $record->rowID] ]) !!}
                            {!! Form::submit('Unlock', ['class' => 'btn btn-danger']) !!}
                            {!! Form::close() !!}
                        </td>
                    </tr>
                @endforeach
                </tbody>
            </table>
        </div>
    </div>

@endsection