<!DOCTYPE html>
<html>
<head>
    <title>Dashboard</title>
</head>
<body>
    <h2>Bienvenido al Dashboard</h2>
    <p>¡Has iniciado sesión correctamente!</p>
    <form method="POST" action="<?php echo e(url('/logout')); ?>">
        <?php echo csrf_field(); ?>
        <button type="submit">Cerrar sesión</button>
    </form>
</body>
</html>
<?php /**PATH C:\wamp64\www\inventluis370\resources\views/dashboard.blade.php ENDPATH**/ ?>