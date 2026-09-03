document.addEventListener('DOMContentLoaded', () => {

  /* ===== 1. ACEPTAR TERMINOS -> OCULTA EL PANEL IZQUIERDO ===== */
  const termsPanel = document.getElementById('termsPanel');
  const btnAceptar = document.getElementById('btnAceptar');

  btnAceptar.addEventListener('click', () => {
    termsPanel.classList.add('is-hidden');
    // Espera a que termine la transición para sacarlo del flujo por completo
    termsPanel.addEventListener('transitionend', () => {
      termsPanel.style.display = 'none';
    }, { once: true });
  });

  /* ===== 2. BOTON "+" -> ABRE / CIERRA EL MENU DE ADJUNTOS ===== */
  const btnPlus = document.getElementById('btnPlus');
  const plusMenu = document.getElementById('plusMenu');

  btnPlus.addEventListener('click', (e) => {
    e.stopPropagation();
    plusMenu.classList.toggle('is-open');
  });

  // Cierra el menú si se hace click fuera de él
  document.addEventListener('click', (e) => {
    if (!plusMenu.contains(e.target) && e.target !== btnPlus) {
      plusMenu.classList.remove('is-open');
    }
  });

  // Las opciones del menú son funcionales: al elegir una, se cierra el menú
  plusMenu.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      plusMenu.classList.remove('is-open');
      // Aquí se podría disparar la acción real (abrir cámara, subir archivo, etc.)
      console.log('Opción seleccionada:', btn.textContent.trim());
    });
  });

  /* ===== 3. CHAT: ENVIAR MENSAJE Y RECIBIR RESPUESTA (DICCIONARIO DE PALABRAS CLAVE) =====
     Este script NO llama a ninguna IA de pago ni a ningún backend.
     Todo funciona localmente en el navegador, así que es 100% gratis.

     IMPORTANTE: Este diccionario da orientación GENERAL, no diagnostica
     ni reemplaza una consulta médica. Todas las respuestas de síntomas
     terminan invitando a confirmar con un profesional cuando corresponde,
     y ninguna incluye dosis específicas de medicamentos (eso siempre debe
     definirlo un médico). */
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const sendBtn = document.getElementById('sendBtn');

  // Respuesta que se usa cuando el mensaje del usuario NO coincide
  // con ninguna palabra clave del diccionario.
  const RESPUESTA_POR_DEFECTO = 'Claro, en que puedo ayudarte';

  // Diccionario de respuestas por defecto: si el mensaje del usuario
  // contiene alguna de estas palabras clave, se responde al instante
  // con el texto correspondiente.
  const DEFAULT_RESPONSES = {

    /* ---------- SALUDOS Y CORTESÍA ---------- */
    'hola': '¡Hola! Soy SAND IA. ¿En qué puedo ayudarte hoy?',
    'buenos dias': '¡Buenos días! ¿Cómo te sientes hoy?',
    'buenas tardes': '¡Buenas tardes! ¿En qué puedo ayudarte?',
    'buenas noches': '¡Buenas noches! Cuéntame qué necesitas.',
    'como estas': 'Estoy aquí para ayudarte con tus dudas de salud. ¿Qué necesitas hoy?',
    'gracias': 'Con gusto, para eso estoy. Si necesitas algo más, aquí estoy.',
    'adios': '¡Hasta pronto! Cuídate mucho.',
    'hasta luego': '¡Hasta luego! Cualquier cosa, aquí estaré.',
    'ayuda': 'Puedo orientarte sobre síntomas comunes, medicamentos, citas y documentos. ¿Sobre qué tema quieres saber más?',

    /* ---------- EMERGENCIAS (van primero en importancia, aunque el orden real lo da el largo de la clave) ---------- */
    'emergencia': '⚠️ Si esto es una emergencia médica real, por favor comunícate de inmediato con los servicios de emergencia de tu localidad o acude al centro de salud más cercano.',
    'no puedo respirar': '⚠️ La dificultad severa para respirar es una emergencia. Busca ayuda médica inmediata o llama a los servicios de emergencia ahora mismo.',
    'dolor en el pecho': '⚠️ El dolor de pecho puede ser señal de algo serio, especialmente si se acompaña de falta de aire, sudoración o dolor en el brazo. Busca atención médica de urgencia de inmediato.',
    'dolor pecho': '⚠️ El dolor de pecho puede ser señal de algo serio, especialmente si se acompaña de falta de aire, sudoración o dolor en el brazo. Busca atención médica de urgencia de inmediato.',
    'sangrado abundante': '⚠️ Un sangrado abundante o que no se detiene requiere atención médica urgente. Acude a un servicio de emergencias lo antes posible.',
    'perdida de conciencia': '⚠️ Si alguien pierde el conocimiento, es una emergencia. Busca ayuda médica inmediata.',
    'convulsion': '⚠️ Ante una convulsión, protege a la persona de golpes, no la sujetes con fuerza ni le pongas nada en la boca, y busca atención médica de inmediato.',
    'intoxicacion': '⚠️ Ante una posible intoxicación, contacta de inmediato a un centro de emergencias o toxicología y, si es posible, ten a la mano el envase o sustancia involucrada.',
    'quemadura grave': '⚠️ Las quemaduras extensas o profundas requieren atención médica urgente. Enfría la zona con agua limpia y busca ayuda inmediata.',
    'accidente': '⚠️ Si acabas de sufrir un accidente y hay lesiones importantes, comunícate de inmediato con los servicios de emergencia.',

    /* ---------- CABEZA Y NEUROLÓGICO ---------- */
    'dolor de cabeza': 'Para el dolor de cabeza, descansa en un lugar tranquilo, mantente hidratado y evita pantallas por un rato. Si el dolor es muy fuerte, repentino o recurrente, consulta a tu médico.',
    'migrana': 'La migraña suele mejorar con reposo en un lugar oscuro y silencioso e hidratación. Si es muy frecuente o intensa, es importante que un médico evalúe un tratamiento adecuado para ti.',
    'mareo': 'El mareo puede deberse a varias causas (presión, oído, deshidratación, entre otras). Siéntate o acuéstate para evitar caídas y, si persiste o se repite, consulta a un médico.',
    'vertigo': 'El vértigo (sensación de que todo gira) puede tener distintas causas. Evita movimientos bruscos y consulta con un médico si es frecuente o intenso.',
    'desmayo': 'Si sientes que vas a desmayarte, siéntate o acuéstate con las piernas elevadas. Si llegó a ocurrir una pérdida de conciencia, es importante consultarlo con un médico.',
    'perdida de memoria': 'Los problemas de memoria pueden tener múltiples causas y merecen una evaluación médica, especialmente si son recientes o van en aumento.',
    'hormigueo': 'El hormigueo u adormecimiento puede deberse a mala postura o compresión nerviosa temporal. Si es persistente, afecta un solo lado del cuerpo o aparece de forma súbita, consulta a un médico cuanto antes.',

    /* ---------- OJOS ---------- */
    'ojo rojo': 'El enrojecimiento ocular puede deberse a irritación, alergia o infección. Evita frotarte el ojo y, si hay dolor, secreción o cambios en la visión, consulta a un oftalmólogo.',
    'vision borrosa': 'La visión borrosa puede tener varias causas. Si aparece de forma repentina o se acompaña de otros síntomas, consulta a un médico u oftalmólogo lo antes posible.',
    'dolor de ojos': 'El dolor ocular persistente debe ser evaluado por un oftalmólogo, sobre todo si se acompaña de cambios en la visión.',
    'conjuntivitis': 'La conjuntivitis suele causar enrojecimiento, picazón y secreción. Evita compartir toallas o maquillaje y consulta a un médico para confirmar el tipo y el tratamiento adecuado.',

    /* ---------- OÍDOS ---------- */
    'dolor de oido': 'El dolor de oído puede deberse a infección, cambios de presión o cera acumulada. Evita introducir objetos en el oído y consulta a un médico si el dolor persiste o hay secreción.',
    'zumbido en el oido': 'El zumbido en los oídos (tinnitus) puede tener varias causas. Si es persistente o afecta tu audición, conviene que lo evalúe un médico.',
    'perdida de audicion': 'Una disminución repentina de la audición debe evaluarse cuanto antes por un médico especialista.',

    /* ---------- GARGANTA Y RESPIRATORIO ---------- */
    'dolor de garganta': 'Para el dolor de garganta, prueba con líquidos tibios, gárgaras de agua con sal y descanso de la voz. Si dura más de unos días, hay fiebre alta o dificultad para tragar, consulta a un médico.',
    'tos': 'Para la tos, mantente hidratado y evita el humo o ambientes muy secos. Si dura más de una semana, viene con fiebre alta o dificultad para respirar, te recomiendo consultar a un médico.',
    'tos con sangre': '⚠️ Toser con sangre debe ser evaluado por un médico de inmediato.',
    'gripe': 'Para la gripe: descansa, hidrátate bien y controla la fiebre si aparece. Si los síntomas empeoran o duran más de una semana, busca atención médica.',
    'resfriado': 'Un resfriado común suele mejorar con descanso, líquidos e hidratación. Si los síntomas empeoran o se prolongan más de 10 días, consulta a un médico.',
    'gripa': 'Para la gripa: descansa, hidrátate bien y controla la fiebre si aparece. Si empeora o dura más de una semana, consulta a un médico.',
    'fiebre': 'Si tienes fiebre, procura mantenerte hidratado, descansar y monitorear tu temperatura. Si supera los 39°C, dura más de 3 días o se acompaña de otros síntomas de alarma, te recomiendo consultar con un médico.',
    'falta de aire': 'La dificultad para respirar debe tomarse en serio. Si es leve y ya conoces la causa (por ejemplo, asma controlada), sigue tu plan habitual; si es intensa o nueva, busca atención médica urgente.',
    'dificultad para respirar': 'La dificultad para respirar debe tomarse en serio. Si es leve y ya conoces la causa, sigue tu plan habitual; si es intensa o nueva, busca atención médica urgente.',
    'asma': 'Si tienes una crisis de asma, usa tu inhalador de rescate según lo indicado por tu médico. Si no mejora o empeora, busca atención médica urgente.',
    'congestion nasal': 'La congestión nasal suele aliviarse con lavados nasales con solución salina e hidratación. Si persiste muchos días o hay dolor facial intenso, consulta a un médico.',
    'sinusitis': 'La sinusitis puede causar dolor facial, congestión y secreción espesa. Los lavados nasales ayudan a aliviar, pero si el dolor es intenso o hay fiebre, consulta a un médico.',
    'bronquitis': 'La bronquitis suele mejorar con reposo, hidratación y evitar irritantes como el humo. Si la tos persiste muchas semanas o hay fiebre alta, consulta a un médico.',
    'neumonia': 'La neumonía es una infección pulmonar que requiere evaluación médica, especialmente si hay fiebre alta, dificultad para respirar o dolor al respirar. Busca atención médica pronto.',
    'covid': 'Si sospechas COVID-19, aísla­te, descansa, hidrátate y monitorea síntomas como fiebre o dificultad para respirar. Si empeoran, busca atención médica y considera hacerte una prueba.',

    /* ---------- DIGESTIVO ---------- */
    'dolor de estomago': 'Para el malestar estomacal, evita comidas pesadas o irritantes y mantente hidratado. Si el dolor persiste más de un día, es muy intenso o se acompaña de fiebre, busca atención médica.',
    'dolor abdominal': 'El dolor abdominal puede tener muchas causas. Si es intenso, se ubica en un punto fijo, o se acompaña de fiebre o vómito, consulta a un médico cuanto antes.',
    'nauseas': 'Para las náuseas, prueba con comidas ligeras, líquidos en pequeñas cantidades y reposo. Si son persistentes o intensas, consulta a un médico.',
    'vomito': 'Ante el vómito, hidrátate con pequeños sorbos de líquido y evita comidas pesadas. Si es persistente, tiene sangre o hay signos de deshidratación, busca atención médica.',
    'diarrea': 'Para la diarrea, mantén una buena hidratación con agua o suero oral y evita alimentos irritantes. Si dura más de 2 días, tiene sangre o hay fiebre alta, consulta a un médico.',
    'estreñimiento': 'Para el estreñimiento, aumenta el consumo de agua, fibra (frutas, verduras, granos enteros) y actividad física. Si persiste varios días o hay dolor intenso, consulta a un médico.',
    'acidez': 'La acidez estomacal puede mejorar evitando comidas picantes, grasosas o muy abundantes, y no acostarte justo después de comer. Si es frecuente, consulta a un médico.',
    'reflujo': 'El reflujo puede mejorar con cambios en la alimentación y evitando acostarte inmediatamente después de comer. Si es frecuente o intenso, consulta a un médico.',
    'gastritis': 'La gastritis suele mejorar evitando irritantes como el alcohol, café en exceso o comidas muy condimentadas. Un médico puede indicarte el manejo adecuado según tu caso.',
    'perdida de apetito': 'La falta de apetito prolongada o acompañada de pérdida de peso debe evaluarse con un médico.',
    'sangre en las heces': '⚠️ La presencia de sangre en las heces debe evaluarse cuanto antes con un médico.',

    /* ---------- PIEL ---------- */
    'sarpullido': 'Para un sarpullido leve, evita rascarte y usa ropa suave. Si se extiende, pica mucho, o se acompaña de fiebre, consulta a un médico.',
    'erupcion en la piel': 'Las erupciones cutáneas pueden tener muchas causas. Si aparecen de forma súbita, se extienden o vienen con fiebre, consulta a un médico.',
    'picazon': 'La picazón puede deberse a piel seca, alergia o irritación. Mantén la piel hidratada y evita rascarte. Si persiste, consulta a un médico.',
    'alergia': 'Si tienes síntomas de alergia (estornudos, picazón, enrojecimiento), evita el contacto con lo que la provoca y consulta a tu médico si los síntomas son fuertes o no mejoran.',
    'reaccion alergica': 'Ante una reacción alérgica, evita el alérgeno sospechoso. Si hay hinchazón en cara o garganta, o dificultad para respirar, es una emergencia: busca ayuda de inmediato.',
    'urticaria': 'La urticaria (ronchas que pican) suele deberse a una reacción alérgica. Si se acompaña de hinchazón facial o dificultad para respirar, busca atención de urgencia.',
    'herida': 'Limpia la herida con agua limpia y jabón suave, cúbrela y observa si hay signos de infección (enrojecimiento, calor, pus). Si es profunda o no deja de sangrar, busca atención médica.',
    'quemadura': 'Para una quemadura leve, enfría la zona con agua fría (no helada) durante varios minutos y cúbrela sin reventar ampollas. Si es extensa, profunda o en cara/manos, busca atención médica.',
    'picadura': 'Ante una picadura de insecto, limpia la zona y aplica frío local. Si hay hinchazón importante, dificultad para respirar o mareo, busca atención médica de inmediato.',

    /* ---------- MUSCULOESQUELÉTICO ---------- */
    'dolor de espalda': 'Para el dolor de espalda, evita cargar peso, mantén una buena postura y aplica calor local si ayuda. Si es intenso, se irradia a las piernas o dura varias semanas, consulta a un médico.',
    'dolor muscular': 'El dolor muscular leve suele mejorar con descanso, estiramientos suaves e hidratación. Si es muy intenso o no mejora en varios días, consulta a un médico.',
    'dolor de articulaciones': 'El dolor articular puede deberse a esfuerzo, inflamación u otras causas. Si hay hinchazón, enrojecimiento o limita mucho el movimiento, consulta a un médico.',
    'torcedura': 'Ante una torcedura, aplica frío local, mantén reposo y eleva la zona afectada. Si hay mucha hinchazón o no puedes apoyar el miembro, consulta a un médico.',
    'esguince': 'Para un esguince, aplica frío, mantén reposo, compresión y elevación de la zona. Si el dolor es muy intenso o hay deformidad, busca atención médica.',
    'fractura': '⚠️ Si sospechas una fractura (dolor muy intenso, deformidad, imposibilidad de mover la zona), inmoviliza la zona y busca atención médica urgente.',
    'dolor de cuello': 'El dolor de cuello suele mejorar con estiramientos suaves y buena postura. Si es intenso, se irradia al brazo o aparece tras un golpe, consulta a un médico.',
    'dolor lumbar': 'El dolor lumbar mejora con reposo relativo, evitando cargar peso y con calor local. Si se irradia a la pierna o dura semanas, consulta a un médico.',

    /* ---------- CARDIOVASCULAR ---------- */
    'presion': 'Si tienes molestias relacionadas con la presión arterial (mareo, dolor de cabeza fuerte, visión borrosa), te recomiendo medirte la presión y consultar a un médico lo antes posible.',
    'presion alta': 'La presión arterial alta debe controlarse con seguimiento médico regular. Si tienes síntomas como dolor de cabeza intenso, visión borrosa o dolor de pecho, busca atención médica de inmediato.',
    'hipertension': 'La hipertensión requiere control médico continuo, alimentación baja en sodio y actividad física regular. Sigue las indicaciones de tu médico para el manejo adecuado.',
    'presion baja': 'La presión baja puede causar mareo o debilidad. Siéntate, hidrátate y evita levantarte bruscamente. Si es frecuente o intensa, consulta a un médico.',
    'palpitaciones': 'Las palpitaciones (sentir el corazón acelerado o irregular) deben evaluarse por un médico, especialmente si se acompañan de dolor de pecho, mareo o falta de aire.',
    'taquicardia': 'La taquicardia (ritmo cardíaco acelerado) debe ser evaluada por un médico si es frecuente o se acompaña de otros síntomas como mareo o dolor de pecho.',

    /* ---------- URINARIO Y RENAL ---------- */
    'dolor al orinar': 'El dolor o ardor al orinar puede indicar una infección urinaria. Mantente bien hidratado y consulta a un médico para confirmar y recibir tratamiento adecuado.',
    'infeccion urinaria': 'Las infecciones urinarias suelen causar ardor al orinar, urgencia y a veces fiebre. Es importante que un médico las evalúe y trate para evitar complicaciones.',
    'sangre en la orina': '⚠️ La presencia de sangre en la orina debe evaluarse cuanto antes con un médico.',
    'orina oscura': 'La orina muy oscura puede deberse a deshidratación, entre otras causas. Aumenta tu consumo de agua y, si persiste, consulta a un médico.',
    'calculos renales': 'Los cálculos renales pueden causar dolor intenso en la espalda o el costado. Si tienes dolor muy fuerte, sangre en la orina o fiebre, busca atención médica.',

    /* ---------- SALUD MENTAL Y BIENESTAR EMOCIONAL ---------- */
    'estres': 'El estrés es una respuesta normal, pero cuando es constante puede afectar tu bienestar. Técnicas de respiración, actividad física y buen descanso pueden ayudar. Si te sientes desbordado, hablar con un profesional de salud mental puede ser de gran ayuda.',
    'ansiedad': 'La ansiedad puede manifestarse con preocupación excesiva, tensión o dificultad para relajarte. Técnicas de respiración y actividad física pueden ayudar, pero si interfiere con tu día a día, te recomiendo hablar con un profesional de salud mental.',
    'insomnio': 'Para dormir mejor, procura mantener horarios regulares, evitar pantallas antes de dormir y limitar la cafeína. Si el insomnio persiste varias semanas, consulta a un médico.',
    'no puedo dormir': 'Para dormir mejor, procura mantener horarios regulares, evitar pantallas antes de dormir y limitar la cafeína. Si el problema persiste, consulta a un médico.',
    'triste': 'Lamento que te sientas así. Está bien no estar bien todo el tiempo. Si esta sensación persiste o se vuelve más intensa, hablar con un profesional de salud mental puede ayudarte mucho.',
    'depresion': 'Si sientes tristeza persistente, falta de energía o desinterés en actividades que antes disfrutabas, es importante hablar con un profesional de salud mental que pueda acompañarte.',
    'cansancio': 'El cansancio persistente puede tener muchas causas (sueño, alimentación, estrés, entre otras). Si no mejora con descanso, consulta a un médico.',
    'agotamiento': 'El agotamiento constante merece atención. Prioriza el descanso y, si no mejora, consulta a un médico para descartar otras causas.',

    /* ---------- SALUD FEMENINA ---------- */
    'embarazo': 'Si crees que puedes estar embarazada o tienes dudas durante tu embarazo, te recomiendo agendar una cita con tu ginecólogo para un seguimiento adecuado.',
    'menstruacion': 'Los cambios en el ciclo menstrual pueden tener varias causas. Si notas dolor muy intenso, sangrado abundante o irregularidades frecuentes, consulta a un ginecólogo.',
    'dolor menstrual': 'Para el dolor menstrual, el calor local y el descanso pueden ayudar. Si el dolor es muy intenso y limita tus actividades, consulta a un ginecólogo.',
    'sangrado irregular': 'El sangrado irregular fuera de tu ciclo habitual debe evaluarse con un ginecólogo.',
    'lactancia': 'Para dudas sobre lactancia (dolor, poca producción, entre otras), te recomiendo consultar con tu médico o un especialista en lactancia.',

    /* ---------- PEDIATRÍA / NIÑOS ---------- */
    'fiebre en niños': 'En niños, controla la temperatura y mantenlo hidratado. Si la fiebre supera los 38.5°C en bebés pequeños, dura varios días o hay otros síntomas de alarma, consulta a un pediatra.',
    'fiebre en bebe': 'En bebés, la fiebre debe evaluarse con cuidado, sobre todo en menores de 3 meses. Consulta a un pediatra ante cualquier fiebre en un bebé pequeño.',
    'vacunas': 'Para dudas sobre el esquema de vacunación de tu hijo o hija, te recomiendo consultarlo con su pediatra, quien podrá orientarte según su edad y su carnet de vacunación.',
    'llanto en bebe': 'El llanto persistente e inconsolable en un bebé puede tener varias causas. Si no cede o se acompaña de fiebre u otros síntomas, consulta a un pediatra.',

    /* ---------- MEDICAMENTOS Y TRATAMIENTOS ---------- */
    'medicamento': 'Recuerda tomar tus medicamentos exactamente como fueron recetados. Si tienes dudas sobre una dosis, consulta con tu médico antes de hacer cambios.',
    'dosis': 'La dosis correcta depende del medicamento y de tu caso particular; revisa tu receta o consulta directamente con tu médico antes de ajustar cualquier dosis.',
    'efectos secundarios': 'Si notas efectos secundarios de un medicamento, no lo suspendas por tu cuenta; comunícate con tu médico para que evalúe si es necesario un ajuste.',
    'olvide tomar mi medicamento': 'Si olvidaste una dosis, no dupliques la siguiente por tu cuenta. Consulta con tu médico o farmacéutico sobre qué hacer según el medicamento específico.',
    'interaccion medicamentosa': 'Combinar medicamentos sin supervisión puede ser riesgoso. Consulta siempre con tu médico o farmacéutico antes de mezclar tratamientos.',
    'antibiotico': 'Los antibióticos deben tomarse exactamente como los recetó tu médico, completando el tratamiento aunque te sientas mejor antes. No los tomes sin indicación médica.',

    /* ---------- ADMINISTRATIVO / PLATAFORMA ---------- */
    'cita': 'Para agendar una cita, ve a la sección de "Especialidades" o "Servicios" en el menú principal de MedLife.',
    'agendar cita': 'Para agendar una cita, ve a la sección de "Especialidades" o "Servicios" en el menú principal de MedLife.',
    'cancelar cita': 'Para cancelar o reprogramar una cita, ve a la sección "Mis Citas" en tu perfil de MedLife.',
    'receta': 'Puedes ver tus recetas y documentos generados en la sección "Archivos Generados", en el panel derecho de esta pantalla.',
    'resultados': 'Tus resultados de exámenes, cuando estén disponibles, aparecerán en la sección "Archivos Generados" de tu perfil.',
    'examenes': 'Puedes consultar tus órdenes y resultados de exámenes en la sección "Archivos Generados" de tu perfil.',
    'especialista': 'Para ver la lista de especialistas disponibles, visita la sección "Especialidades" en el menú principal.',
    'seguro medico': 'Para dudas sobre tu cobertura o seguro médico, te recomiendo revisar la sección "Mi Cuenta" o comunicarte con soporte de MedLife.',
    'factura': 'Puedes consultar tus facturas y comprobantes de pago en la sección "Mi Cuenta" de la plataforma.',

    /* ---------- ESTILO DE VIDA / PREVENCIÓN ---------- */
    'alimentacion': 'Una alimentación balanceada, con frutas, verduras, proteínas y buena hidratación, es clave para tu salud general. Si necesitas un plan específico, un nutricionista puede orientarte mejor.',
    'ejercicio': 'La actividad física regular (al menos 150 minutos moderados por semana) aporta grandes beneficios a tu salud. Consulta a tu médico antes de empezar una rutina intensa si tienes alguna condición previa.',
    'dieta': 'Antes de iniciar una dieta específica, sobre todo si tienes alguna condición de salud, es recomendable que la revise un nutricionista o tu médico.',
    'bajar de peso': 'Para bajar de peso de forma saludable, combina una alimentación balanceada con actividad física regular. Un nutricionista puede ayudarte a diseñar un plan seguro para ti.',
    'fumar': 'Dejar de fumar es una de las mejores decisiones para tu salud. Si buscas apoyo para lograrlo, tu médico puede orientarte sobre estrategias y recursos disponibles.',
    'alcohol': 'El consumo excesivo de alcohol puede afectar tu salud a corto y largo plazo. Si te preocupa tu consumo o el de alguien cercano, hablar con un profesional de salud puede ayudar.',

    /* ---------- FALLBACK EXPLÍCITO ---------- */
    'no se': 'No hay problema, cuéntame con tus palabras qué es lo que sientes o qué necesitas y trataré de orientarte.',
    'dolor': 'Cuéntame un poco más: ¿en qué parte del cuerpo sientes el dolor y desde hace cuánto?'
  };

  /**
   * Busca si el texto del usuario contiene alguna palabra clave del
   * diccionario. Revisa las claves más largas primero (por ejemplo
   * "dolor de cabeza" antes que "dolor") para que la respuesta sea
   * lo más específica posible. Ignora mayúsculas y tildes.
   * Si no encuentra nada, devuelve null.
   */
  function buscarRespuestaPorDefecto(texto) {
    const normalizado = texto
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // quita tildes

    const claves = Object.keys(DEFAULT_RESPONSES).sort((a, b) => b.length - a.length);

    for (const clave of claves) {
      if (normalizado.includes(clave)) {
        return DEFAULT_RESPONSES[clave];
      }
    }
    return null;
  }

  function iaAvatarSVG() {
    return `<span class="ia-avatar">
      <svg viewBox="0 0 40 40" width="18" height="18">
        <g fill="#2aafe7">
          <path d="M20 3 L24 17 L20 20 L16 17 Z"/>
          <path d="M20 37 L24 23 L20 20 L16 23 Z"/>
          <path d="M3 20 L17 16 L20 20 L17 24 Z"/>
          <path d="M37 20 L23 16 L20 20 L23 24 Z"/>
        </g>
      </svg>
    </span>`;
  }

  function addMessage(text, from) {
    const wrap = document.createElement('div');
    wrap.className = from === 'user' ? 'msg msg--user' : 'msg msg--ia';

    if (from === 'ia') {
      wrap.innerHTML = `${iaAvatarSVG()}<p></p>`;
    } else {
      wrap.innerHTML = `<p></p>`;
    }
    wrap.querySelector('p').textContent = text;

    chatMessages.appendChild(wrap);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return wrap;
  }

  function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    chatInput.value = '';

    // Busca en el diccionario; si no hay ninguna coincidencia,
    // usa la respuesta por defecto ("Claro, en que puedo ayudarte").
    const respuesta = buscarRespuestaPorDefecto(text) || RESPUESTA_POR_DEFECTO;

    // Simula un pequeño tiempo de "respuesta" para que se sienta natural
    setTimeout(() => {
      addMessage(respuesta, 'ia');
    }, 700);
  }

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }

  /* ===== 4. ARCHIVOS GENERADOS -> MUESTRA EL DOCUMENTO Y CAMBIA EL PANEL DERECHO ===== */
  const docThumbBtn = document.getElementById('docThumbBtn');
  const docOverlay = document.getElementById('docOverlay');
  const pillBtn = document.getElementById('pillBtn');
  const historialList = document.getElementById('historialList');
  const recomendacionesList = document.getElementById('recomendacionesList');

  function showDocumento() {
    docOverlay.classList.add('is-open');
    pillBtn.textContent = 'RECOMENDACIONES';
    historialList.hidden = true;
    recomendacionesList.hidden = false;
  }

  function hideDocumento() {
    docOverlay.classList.remove('is-open');
    pillBtn.textContent = 'HISTORIAL';
    historialList.hidden = false;
    recomendacionesList.hidden = true;
  }

  docThumbBtn.addEventListener('click', showDocumento);

  // Cierra el documento al hacer click fuera de la tarjeta blanca
  docOverlay.addEventListener('click', (e) => {
    if (e.target === docOverlay) hideDocumento();
  });

  /* ===== BOTON VOLVER (placeholder funcional) ===== */
  document.getElementById('backBtn').addEventListener('click', () => {
    console.log('Volver a la pantalla anterior');
  });

});