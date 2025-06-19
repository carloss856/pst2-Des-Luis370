<!DOCTYPE html>
<html>
<head>
    <title>Iniciar sesión</title>
</head>
<body>
    <h2>Iniciar sesión</h2>
    <form method="POST" action="<?php echo e(url('/login')); ?>">
        <?php echo csrf_field(); ?>
        <label>Email:</label>
        <input type="email" name="email" required><br>
        <label>Contraseña:</label>
        <input type="password" name="contrasena" required><br>
        <button type="submit">Entrar</button>
    </form>
    <?php if(session('error')): ?>
        <div style="color:red;"><?php echo e(session('error')); ?></div>
    <?php endif; ?>
</body>
</html><?php /**PATH C:\wamp64\www\inventluis370\resources\views/auth/login.blade.php ENDPATH**/ ?>