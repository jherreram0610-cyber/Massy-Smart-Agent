import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Dealership Info ─────────────────────────────────────────────────────
  await prisma.dealershipInfo.upsert({
    where: { key: "name" },
    update: {},
    create: { key: "name", value: "Massy Motors Smart Cali" },
  });
  await prisma.dealershipInfo.upsert({
    where: { key: "address" },
    update: {},
    create: { key: "address", value: "Av. 6N #25-25, Barrio Granada, Cali, Valle del Cauca" },
  });
  await prisma.dealershipInfo.upsert({
    where: { key: "hours" },
    update: {},
    create: { key: "hours", value: "Lunes a Viernes: 8am - 6pm | Sábados: 9am - 2pm | Domingos: Cerrado" },
  });
  await prisma.dealershipInfo.upsert({
    where: { key: "phone" },
    update: {},
    create: { key: "phone", value: "+57 2 889-0000" },
  });
  await prisma.dealershipInfo.upsert({
    where: { key: "whatsapp" },
    update: {},
    create: { key: "whatsapp", value: "+57 300 000-0000" },
  });
  await prisma.dealershipInfo.upsert({
    where: { key: "city" },
    update: {},
    create: { key: "city", value: "Cali, Colombia" },
  });

  // ─── Vehículos Smart ─────────────────────────────────────────────────────
  await prisma.vehicle.upsert({
    where: { slug: "smart_1" },
    update: {},
    create: {
      slug: "smart_1",
      name: "Smart #1",
      description:
        "El Smart #1 es un crossover eléctrico compacto y dinámico. Perfecto para la ciudad con gran autonomía y tecnología de punta. Diseño moderno y premium que combina practicidad con elegancia.",
      priceFrom: 120000000,
      priceTo: 145000000,
      features: [
        "Autonomía hasta 420 km (WLTP)",
        "Carga rápida DC 150kW — de 10% a 80% en ~30 minutos",
        "Pantalla táctil 12.8\" giratoria",
        "Cámara 360°",
        "Techo panorámico",
        "Carga inalámbrica para smartphone",
        "ADAS Level 2 (asistencia de conducción)",
        "Acceso sin llave",
        "Sistema de audio premium",
        "Actualización over-the-air (OTA)",
      ],
      colors: [
        "Crystal White",
        "Midnight Black",
        "Magnetic Grey",
        "Lava Orange",
        "Aqua Turquoise",
      ],
      specs: {
        motor: "Eléctrico permanente síncrono de imán",
        potencia: "200 kW (272 CV)",
        torque: "343 Nm",
        autonomia: "420 km WLTP",
        bateria: "66 kWh",
        cargaAC: "22 kW",
        cargaDC: "150 kW",
        aceleracion: "0-100 km/h en 6.7 segundos",
        velocidadMaxima: "180 km/h",
        dimensiones: "4270 x 1822 x 1636 mm",
        peso: "1820 kg",
        maletero: "273 litros (+ 15 litros frunk)",
      },
      isActive: true,
    },
  });

  await prisma.vehicle.upsert({
    where: { slug: "smart_3" },
    update: {},
    create: {
      slug: "smart_3",
      name: "Smart #3",
      description:
        "El Smart #3 es un fastback eléctrico deportivo y elegante. Mayor autonomía, diseño coupé y equipamiento premium. La opción ideal para quienes buscan estilo y rendimiento en un vehículo eléctrico.",
      priceFrom: 155000000,
      priceTo: 178000000,
      features: [
        "Autonomía hasta 455 km (WLTP)",
        "Carga rápida DC 150kW",
        "Pantalla táctil 12.8\" giratoria con Android Automotive",
        "Cámara 360° + sensores de aparcamiento",
        "Techo panorámico de cristal",
        "Asientos con ventilación y calefacción",
        "ADAS Level 2+",
        "Sistema de sonido Beats Audio 13 altavoces",
        "Head-up display",
        "Carga inalámbrica dual",
      ],
      colors: [
        "Polar White",
        "Eclipse Black",
        "Steel Grey",
        "Mountain Green",
        "Copper Orange",
      ],
      specs: {
        motor: "Eléctrico permanente síncrono de imán",
        potencia: "200 kW (272 CV)",
        torque: "343 Nm",
        autonomia: "455 km WLTP",
        bateria: "66 kWh",
        cargaAC: "22 kW",
        cargaDC: "150 kW",
        aceleracion: "0-100 km/h en 5.8 segundos",
        velocidadMaxima: "180 km/h",
        dimensiones: "4400 x 1844 x 1556 mm",
        peso: "1870 kg",
        maletero: "370 litros",
      },
      isActive: true,
    },
  });

  await prisma.vehicle.upsert({
    where: { slug: "smart_3_brabus" },
    update: {},
    create: {
      slug: "smart_3_brabus",
      name: "Smart #3 Brabus",
      description:
        "El Smart #3 Brabus es la versión de alto rendimiento desarrollada con Brabus. Tracción total AWD, 315 kW de potencia, acabados exclusivos y accesorios deportivos Brabus. Para quienes no aceptan compromisos.",
      priceFrom: 210000000,
      priceTo: 235000000,
      features: [
        "Tracción total AWD (2 motores)",
        "315 kW (428 CV) de potencia",
        "0-100 km/h en 3.9 segundos",
        "Autonomía hasta 415 km WLTP",
        "Kit aerodinámico Brabus exclusivo",
        "Llantas Brabus 20\"",
        "Interior Brabus con alcántara",
        "Sistema de sonido Beats Audio Premium (13 altavoces)",
        "Todos los equipos del Smart #3 Pro+",
        "Placa identificadora Brabus numerada",
      ],
      colors: [
        "Brabus Starblack",
        "Polar White",
        "Eclipse Black",
        "Copper Orange",
      ],
      specs: {
        motor: "Doble motor eléctrico AWD",
        potencia: "315 kW (428 CV)",
        torque: "543 Nm",
        autonomia: "415 km WLTP",
        bateria: "66 kWh",
        cargaAC: "22 kW",
        cargaDC: "150 kW",
        aceleracion: "0-100 km/h en 3.9 segundos",
        velocidadMaxima: "190 km/h",
        dimensiones: "4400 x 1844 x 1556 mm",
        peso: "2035 kg",
        maletero: "370 litros",
        traccion: "AWD integral",
      },
      isActive: true,
    },
  });

  // ─── Planes de Financiación ───────────────────────────────────────────────
  await prisma.financingPlan.createMany({
    skipDuplicates: true,
    data: [
      {
        bankName: "Bancolombia",
        vehicleSlug: null,
        minRate: 1.2,
        maxRate: 1.8,
        minTerm: 12,
        maxTerm: 72,
        minDownPayment: 30,
        requirements:
          "Certificado de ingresos últimos 3 meses, extractos bancarios últimos 3 meses, cédula, estudio de crédito.",
        notes: "Tasa preferencial para clientes con cuenta Bancolombia. Preaprobación en línea disponible.",
        isActive: true,
      },
      {
        bankName: "Banco de Bogotá",
        vehicleSlug: null,
        minRate: 1.1,
        maxRate: 1.7,
        minTerm: 12,
        maxTerm: 60,
        minDownPayment: 30,
        requirements:
          "Certificado de ingresos, extractos bancarios 3 meses, cédula, referencias personales.",
        notes: "Hasta 100% de financiación para clientes con historial crediticio excelente.",
        isActive: true,
      },
      {
        bankName: "Davivienda",
        vehicleSlug: null,
        minRate: 1.3,
        maxRate: 1.9,
        minTerm: 12,
        maxTerm: 60,
        minDownPayment: 20,
        requirements: "Cédula, certificado de ingresos, extractos bancarios, declaración de renta (si aplica).",
        notes: "Cuota inicial desde el 20%. Seguro de vida incluido en la cuota.",
        isActive: true,
      },
      {
        bankName: "BBVA Colombia",
        vehicleSlug: null,
        minRate: 1.25,
        maxRate: 1.85,
        minTerm: 24,
        maxTerm: 72,
        minDownPayment: 30,
        requirements: "Cédula, comprobante de ingresos, extractos 3 meses.",
        notes: "Tasa especial para vehículos eléctricos. Alianza con Massy Motors.",
        isActive: true,
      },
    ],
  });

  // ─── Promociones ─────────────────────────────────────────────────────────
  await prisma.promotion.createMany({
    skipDuplicates: true,
    data: [
      {
        title: "Tasa especial vehículos eléctricos — 1.1% EM",
        description:
          "En alianza con Bancolombia, ofrecemos tasa del 1.1% efectivo mensual para la compra de cualquier Smart. Válido hasta fin de mes. Aplica con cuota inicial del 30% mínimo y plazo máximo 60 meses.",
        vehicleSlug: null,
        validUntil: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        isActive: true,
      },
      {
        title: "Bono de $5,000,000 en accesorios — Smart #3 Brabus",
        description:
          "Al comprar el Smart #3 Brabus este mes, te regalamos $5,000,000 en accesorios originales Brabus. Incluye tapetes, protector de maletero, y cargador portátil Smart.",
        vehicleSlug: "smart_3_brabus",
        validUntil: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        isActive: true,
      },
    ],
  });

  // ─── Admin por defecto ────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("Jherrera1234*", 12);
  await prisma.advisor.upsert({
    where: { email: "jherreram0610@gmail.com" },
    update: {},
    create: {
      name: "Jorge Herrera",
      email: "jherreram0610@gmail.com",
      passwordHash,
      role: "admin",
      isActive: true,
    },
  });

  console.log("✅ Seed completado.");
  console.log("   Admin: jherreram0610@gmail.com / Jherrera1234*");
  console.log("   Vehículos: Smart #1, Smart #3, Smart #3 Brabus");
  console.log("   Financiación: 4 bancos");
  console.log("   Promociones: 2 activas");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
