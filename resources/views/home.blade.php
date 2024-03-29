<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Company management in Laravel and React</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500">
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" type="text/css" href="https://cdn3.devexpress.com/jslib/19.1.5/css/dx.common.css" />
    <link rel="stylesheet" type="text/css" href="https://cdn3.devexpress.com/jslib/19.1.5/css/dx.light.css" />
</head>
<body>
<div id="root"></div>
<script type="text/javascript">
    window.localStorage.setItem('accessToken', '{{ csrf_token() }}');
</script>
<script src="{{asset('js/app.js')}}"></script>

</body>
</html>
