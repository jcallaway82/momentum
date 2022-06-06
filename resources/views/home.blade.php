@extends('layouts.app')

@section('content')
    <div style="font-size: 11px; padding-left: 10px; width: calc(100vw - 20px)" id="pipeline-new"></div>
    <script type="text/javascript">
        window.data= {!! json_encode($data) !!};
    </script>
@endsection
