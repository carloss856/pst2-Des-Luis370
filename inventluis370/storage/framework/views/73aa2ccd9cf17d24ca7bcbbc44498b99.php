<!DOCTYPE html>
<html>
<head>
    <title>Empresas</title>
</head>
<body>
    <h2>Empresas</h2>
    <a href="<?php echo e(route('empresas.create')); ?>">Crear nueva empresa</a>
    <?php if(session('success')): ?>
        <div style="color:green;"><?php echo e(session('success')); ?></div>
    <?php endif; ?>
    <table border="1" cellpadding="5">
        <tr>
            <!-- <th>ID</th> -->
            <th>Nombre</th>
            <th>Dirección</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Acciones</th>
        </tr>
        <?php $__currentLoopData = $empresas; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $empresa): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
        <tr>
            <!-- <td><?php echo e($empresa->id_empresa); ?></td> -->
            <td><?php echo e($empresa->nombre_empresa); ?></td>
            <td><?php echo e($empresa->direccion); ?></td>
            <td><?php echo e($empresa->telefono); ?></td>
            <td><?php echo e($empresa->email); ?></td>
            <td>
                <a href="<?php echo e(route('empresas.edit', $empresa->id_empresa)); ?>">Editar</a>
                <form action="<?php echo e(route('empresas.destroy', $empresa->id_empresa)); ?>" method="POST" style="display:inline;">
                    <?php echo csrf_field(); ?>
                    <button type="submit" onclick="return confirm('¿Eliminar empresa?')">Eliminar</button>
                </form>
            </td>
        </tr>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    </table>
</body>
</html>
<?php /**PATH C:\wamp64\www\inventluis370\resources\views/empresas/index.blade.php ENDPATH**/ ?>