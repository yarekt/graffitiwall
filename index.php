<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Graffiti Wall</title>
    <!--
        This site is basically @yarekt 's catnip: html5 and paper.js plaything
    -->
    <meta name="Description" content="Distributed online Graffiti Wall built with canvas, HTML5 and JavaScript paper.js, Visit to see lots of people draw in real-time on the same space ! Built by @yarekt">
    <style>
        body {
            margin: 0;
            overflow: hidden;
        }
    </style>
    <script type="text/javascript" src="paper.js"></script>
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>
    <script type="text/paperscript" canvas="canvas" src='wall.js'></script>
    <script type="text/javascript">
        var _gaq = _gaq || [];
        _gaq.push(['_setAccount', 'UA-23748117-2']);
        _gaq.push(['_trackPageview']);

        (function() {
            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
        })();
    </script>
</head>
<body>
    <canvas id="canvas" keepalive="true" width=500 height=200 resize>
        <img src='last.php' alt='Latest Graffiti wall image' title='You do not have html5 canvas support'/>
    </canvas>
</body>
</html>
