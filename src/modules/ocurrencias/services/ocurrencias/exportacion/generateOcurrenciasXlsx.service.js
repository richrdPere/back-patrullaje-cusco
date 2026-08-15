const ExcelJS = require('exceljs');

const formatOcurrenciaRow = require('../../../utils/exportacion/formatOcurrenciaRow');

const generarOcurrenciasXlsx = async (
    ocurrencias,
    {
        generadoPor = null,
    } = {},
) => {
    const workbook =
        new ExcelJS.Workbook();

    workbook.creator =
        generadoPor ||
        'Sistema de Patrullaje Municipal';

    workbook.created = new Date();

    const sheet = workbook.addWorksheet(
        'Ocurrencias',
        {
            views: [
                {
                    state: 'frozen',
                    ySplit: 1,
                },
            ],
        },
    );

    sheet.columns = [
        {
            header: 'N.º ocurrencia',
            key: 'numero_ocurrencia',
            width: 22,
        },
        {
            header: 'Código',
            key: 'codigo',
            width: 12,
        },
        {
            header: 'Modalidad',
            key: 'modalidad',
            width: 35,
        },
        {
            header: 'Categoría específica',
            key: 'categoria_especifica',
            width: 35,
        },
        {
            header: 'Categoría genérica',
            key: 'categoria_generica',
            width: 30,
        },
        {
            header: 'Fecha',
            key: 'fecha_ocurrencia',
            width: 14,
        },
        {
            header: 'Turno',
            key: 'turno',
            width: 14,
        },
        {
            header: 'Sereno',
            key: 'sereno',
            width: 30,
        },
        {
            header: 'Zona',
            key: 'zona',
            width: 25,
        },
        {
            header: 'Dirección',
            key: 'direccion',
            width: 40,
        },
        {
            header: 'Latitud',
            key: 'latitud',
            width: 15,
        },
        {
            header: 'Longitud',
            key: 'longitud',
            width: 15,
        },
        {
            header: 'Resultado',
            key: 'resultado',
            width: 18,
        },
        {
            header: 'Estado',
            key: 'estado',
            width: 20,
        },
        {
            header: 'Remisión',
            key: 'estado_remision',
            width: 20,
        },
        {
            header: 'Fecha de registro',
            key: 'fecha_registro',
            width: 22,
        },
    ];

    ocurrencias
        .map(formatOcurrenciaRow)
        .forEach((fila) => {
            sheet.addRow(fila);
        });

    const header = sheet.getRow(1);

    header.font = {
        bold: true,
        color: {
            argb: 'FFFFFFFF',
        },
    };

    header.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: 'FF0F3D5E',
        },
    };

    header.alignment = {
        vertical: 'middle',
        horizontal: 'center',
    };

    sheet.autoFilter = {
        from: 'A1',
        to: 'P1',
    };

    sheet.eachRow((row) => {
        row.alignment = {
            vertical: 'top',
            wrapText: true,
        };
    });

    const buffer =
        await workbook.xlsx.writeBuffer();

    return Buffer.from(buffer);
};

module.exports = generarOcurrenciasXlsx;