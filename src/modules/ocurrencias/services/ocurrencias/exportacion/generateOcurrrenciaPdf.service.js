const PDFDocument = require('pdfkit');

const texto = (value, defecto = 'SIN DATO') => {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return defecto;
  }

  return String(value);
};

const nombrePersona = (usuario) => {
  const persona = usuario?.persona;

  if (!persona) {
    return 'SIN DATO';
  }

  return [
    persona.nombres,
    persona.apellidos,
  ]
    .filter(Boolean)
    .join(' ')
    .trim() || 'SIN DATO';
};

const fechaHoraPeru = (fecha = new Date()) =>
  new Intl.DateTimeFormat(
    'es-PE',
    {
      timeZone: 'America/Lima',
      dateStyle: 'medium',
      timeStyle: 'medium',
    },
  ).format(fecha);

const agregarTituloSeccion = (
  doc,
  titulo,
) => {
  doc
    .moveDown(0.7)
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor('#0f3d5e')
    .text(titulo.toUpperCase());

  doc
    .moveTo(doc.x, doc.y + 2)
    .lineTo(555, doc.y + 2)
    .strokeColor('#9ca3af')
    .lineWidth(0.5)
    .stroke();

  doc.moveDown(0.5);
};

const agregarCampo = (
  doc,
  etiqueta,
  valor,
) => {
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor('#111827')
    .text(
      `${etiqueta}: `,
      {
        continued: true,
      },
    )
    .font('Helvetica')
    .text(texto(valor));
};

const generarEstadoDocumento = (estado) => {
  if (estado === 'BORRADOR') {
    return {
      etiqueta: 'BORRADOR - SIN VALIDEZ DEFINITIVA',
      color: '#b45309',
      fondo: '#fef3c7',
    };
  }

  if (
    estado === 'VALIDADA' ||
    estado === 'CERRADA'
  ) {
    return {
      etiqueta: 'OCURRENCIA VALIDADA',
      color: '#166534',
      fondo: '#dcfce7',
    };
  }

  return {
    etiqueta: `OCURRENCIA ${texto(estado)}`,
    color: '#991b1b',
    fondo: '#fee2e2',
  };
};

const generarOcurrenciaPdf = async (
  ocurrencia,
  {
    generadoPor = null,
  } = {},
) => {
  const data =
    typeof ocurrencia.toJSON === 'function'
      ? ocurrencia.toJSON()
      : ocurrencia;

  const estadoDocumento =
    generarEstadoDocumento(data.estado);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      bufferPages: true,
      info: {
        Title:
          `Ocurrencia ${data.numero_ocurrencia}`,
        Author:
          'Sistema de Patrullaje Municipal',
        Subject:
          'Formato de ocurrencia',
      },
    });

    const buffers = [];

    doc.on('data', (buffer) => {
      buffers.push(buffer);
    });

    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });

    doc.on('error', reject);

    // ==================================================
    // ENCABEZADO
    // ==================================================
    doc
      .font('Helvetica-Bold')
      .fontSize(15)
      .fillColor('#0f172a')
      .text(
        'REGISTRO DE OCURRENCIA DE SERENAZGO',
        {
          align: 'center',
        },
      );

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#475569')
      .text(
        'Sistema Integral de Patrullaje Municipal',
        {
          align: 'center',
        },
      );

    doc.moveDown(0.8);

    const bannerY = doc.y;

    doc
      .roundedRect(
        40,
        bannerY,
        515,
        28,
        5,
      )
      .fill(estadoDocumento.fondo);

    doc
      .fillColor(estadoDocumento.color)
      .font('Helvetica-Bold')
      .fontSize(11)
      .text(
        estadoDocumento.etiqueta,
        45,
        bannerY + 9,
        {
          width: 505,
          align: 'center',
        },
      );

    doc.y = bannerY + 36;

    agregarCampo(
      doc,
      'Número',
      data.numero_ocurrencia,
    );

    agregarCampo(
      doc,
      'Estado',
      data.estado,
    );

    agregarCampo(
      doc,
      'Fecha de generación',
      fechaHoraPeru(),
    );

    agregarCampo(
      doc,
      'Generado por',
      generadoPor || nombrePersona(data.sereno),
    );

    // ==================================================
    // GENERALIDADES
    // ==================================================
    agregarTituloSeccion(
      doc,
      '1. Generalidades',
    );

    agregarCampo(
      doc,
      'Sereno responsable',
      nombrePersona(data.sereno),
    );

    agregarCampo(
      doc,
      'Fecha de ocurrencia',
      data.fecha_ocurrencia,
    );

    agregarCampo(
      doc,
      'Hora de alerta',
      data.hora_alerta,
    );

    agregarCampo(
      doc,
      'Hora de llegada',
      data.hora_llegada,
    );

    agregarCampo(
      doc,
      'Hora de repliegue',
      data.hora_repliegue,
    );

    agregarCampo(doc, 'Origen', data.origen);
    agregarCampo(doc, 'Turno', data.turno);

    agregarCampo(
      doc,
      'Modalidad de patrullaje',
      data.modalidad_patrullaje,
    );

    agregarCampo(
      doc,
      'Tipo de patrullaje',
      data.tipo_patrullaje,
    );

    // ==================================================
    // CLASIFICACIÓN
    // ==================================================
    agregarTituloSeccion(
      doc,
      '2. Clasificación oficial',
    );

    agregarCampo(
      doc,
      'Código oficial',
      data.modalidad?.codigo,
    );

    agregarCampo(
      doc,
      'Modalidad',
      data.modalidad?.nombre,
    );

    agregarCampo(
      doc,
      'Categoría específica',
      data.modalidad
        ?.categoria_especifica
        ?.nombre,
    );

    agregarCampo(
      doc,
      'Categoría genérica',
      data.modalidad
        ?.categoria_especifica
        ?.categoria_generica
        ?.nombre,
    );

    // ==================================================
    // UBICACIÓN
    // ==================================================
    agregarTituloSeccion(
      doc,
      '3. Ubicación y georreferenciación',
    );

    agregarCampo(
      doc,
      'Zona operativa',
      data.zona?.nombre,
    );

    agregarCampo(
      doc,
      'Tipo de lugar',
      data.tipo_lugar,
    );

    agregarCampo(
      doc,
      'Tipo de vía',
      data.tipo_via,
    );

    agregarCampo(
      doc,
      'Dirección',
      data.direccion,
    );

    agregarCampo(
      doc,
      'Referencia',
      data.referencia,
    );

    agregarCampo(
      doc,
      'Nombre de zona',
      data.nombre_zona,
    );

    agregarCampo(
      doc,
      'Sector',
      data.sector_patrullaje,
    );

    agregarCampo(
      doc,
      'Coordenadas',
      data.latitud !== null &&
        data.longitud !== null
        ? `${data.latitud}, ${data.longitud}`
        : null,
    );

    // ==================================================
    // HECHO
    // ==================================================
    agregarTituloSeccion(
      doc,
      '4. Información del hecho',
    );

    agregarCampo(
      doc,
      'Resultado',
      data.resultado,
    );

    agregarCampo(
      doc,
      'Relación víctima/victimario',
      data.relacion_victima_victimario,
    );

    agregarCampo(
      doc,
      'Datos importantes',
      data.datos_importantes,
    );

    // ==================================================
    // PERSONAS
    // ==================================================
    agregarTituloSeccion(
      doc,
      '5. Personas involucradas',
    );

    if (!data.personas?.length) {
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#374151')
        .text('No se registraron personas.');
    } else {
      data.personas.forEach(
        (persona, index) => {
          doc
            .font('Helvetica-Bold')
            .fontSize(9)
            .text(
              `${index + 1}. ${texto(persona.tipo_persona)
              }`,
            );

          agregarCampo(
            doc,
            'Identificación',
            persona.es_comunidad
              ? 'COMUNIDAD'
              : persona.nombres_apellidos,
          );

          agregarCampo(
            doc,
            'Documento',
            persona.documento_identidad,
          );

          agregarCampo(
            doc,
            'Género',
            persona.genero,
          );

          agregarCampo(
            doc,
            'Edad',
            persona.edad,
          );

          doc.moveDown(0.3);
        },
      );
    }

    // ==================================================
    // EFECTIVOS PNP
    // ==================================================
    agregarTituloSeccion(
      doc,
      '6. Efectivos PNP participantes',
    );

    if (!data.efectivos_pnp?.length) {
      doc
        .font('Helvetica')
        .fontSize(9)
        .text(
          'No se registraron efectivos PNP.',
        );
    } else {
      data.efectivos_pnp.forEach(
        (efectivo, index) => {
          const efectivoNombre = [
            efectivo.grado,
            efectivo.nombres,
            efectivo.apellidos,
          ]
            .filter(Boolean)
            .join(' ');

          agregarCampo(
            doc,
            `Efectivo ${index + 1}`,
            efectivoNombre,
          );

          agregarCampo(
            doc,
            'Comisaría',
            efectivo.comisaria,
          );

          agregarCampo(
            doc,
            'Participación',
            efectivo.tipo_participacion,
          );

          doc.moveDown(0.3);
        },
      );
    }

    // ==================================================
    // CONSECUENCIAS
    // ==================================================
    agregarTituloSeccion(
      doc,
      '7. Consecuencias',
    );

    if (!data.consecuencias?.length) {
      doc
        .font('Helvetica')
        .fontSize(9)
        .text('Sin consecuencias registradas.');
    } else {
      data.consecuencias.forEach(
        (consecuencia, index) => {
          doc
            .font('Helvetica')
            .fontSize(9)
            .text(
              `${index + 1}. ${texto(consecuencia.tipo)
              }: ${texto(
                consecuencia.descripcion,
                '',
              )
              }`,
            );
        },
      );
    }

    // ==================================================
    // MEDIOS
    // ==================================================
    agregarTituloSeccion(
      doc,
      '8. Medios empleados',
    );

    if (!data.medios_empleados?.length) {
      doc
        .font('Helvetica')
        .fontSize(9)
        .text(
          'Sin medios empleados registrados.',
        );
    } else {
      data.medios_empleados.forEach(
        (medio, index) => {
          doc
            .font('Helvetica')
            .fontSize(9)
            .text(
              `${index + 1}. ${texto(medio.tipo)
              }: ${texto(medio.descripcion, '')
              }`,
            );
        },
      );
    }

    // ==================================================
    // EVIDENCIAS
    // ==================================================
    agregarTituloSeccion(
      doc,
      '9. Evidencias',
    );

    const archivos =
      data.incidencia?.archivos || [];

    if (!archivos.length) {
      doc
        .font('Helvetica')
        .fontSize(9)
        .text(
          'No se adjuntaron evidencias accesibles.',
        );
    } else {
      archivos.forEach(
        (archivo, index) => {
          agregarCampo(
            doc,
            `Evidencia ${index + 1}`,
            archivo.nombre_original ||
            archivo.nombre ||
            archivo.tipo,
          );
        },
      );
    }

    // ==================================================
    // PIE DE PÁGINA
    // ==================================================
    const paginas = doc.bufferedPageRange();

    for (
      let pagina = paginas.start;
      pagina < paginas.start + paginas.count;
      pagina += 1
    ) {
      doc.switchToPage(pagina);

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#64748b')
        .text(
          `Documento generado el ${fechaHoraPeru()
          } - Página ${pagina + 1
          } de ${paginas.count}`,
          40,
          805,
          {
            width: 515,
            align: 'center',
          },
        );
    }

    doc.end();
  });
};

module.exports = generarOcurrenciaPdf;