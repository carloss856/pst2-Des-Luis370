<!DOCTYPE html>
<html>
<head>
    <title>Editar Empresa</title>
</head>
<body>
    <h2>Editar Empresa</h2>
    <form method="POST" action="<?php echo e(route('empresas.update', $empresa->id_empresa)); ?>">
        <?php echo csrf_field(); ?>
        <label>Nombre:</label>
        <input type="text" name="nombre_empresa" value="<?php echo e($empresa->nombre_empresa); ?>" required>
        <label>Dirección:</label>
        <input type="text" name="direccion" value="<?php echo e($empresa->direccion); ?>" required>
        <label>Teléfono:</label>
        <input type="text" name="telefono" value="<?php echo e($empresa->telefono); ?>" required>
        <label>Email:</label>
        <input type="email" name="email" value="<?php echo e($empresa->email); ?>" required>
        <button type="submit">Actualizar</button>
    </form>
    <a href="<?php echo e(route('empresas.index')); ?>">Volver</a>
</body>
</html><?php /**PATH C:\wamp64\www\inventluis370\resources\views/empresas/edit.blade.php ENDPATH**/ ?>