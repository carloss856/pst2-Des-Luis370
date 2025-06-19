<!DOCTYPE html>
<html>
<head>
    <title>Crear Empresa</title>
</head>
<body>
    <h2>Crear Empresa</h2>
    <form method="POST" action="<?php echo e(route('empresas.store')); ?>">
        <?php echo csrf_field(); ?>
        <label>Nombre:</label>
        <input type="text" name="nombre_empresa" required>
        <label>Dirección:</label>
        <input type="text" name="direccion" required>
        <label>Teléfono:</label>
        <input type="text" name="telefono" required>
        <label>Email:</label>
        <input type="email" name="email" required>
        <button type="submit">Guardar</button>
    </form>
    <a href="<?php echo e(route('empresas.index')); ?>">Volver</a>
</body>
</html><?php /**PATH C:\wamp64\www\inventluis370\resources\views/empresas/create.blade.php ENDPATH**/ ?>