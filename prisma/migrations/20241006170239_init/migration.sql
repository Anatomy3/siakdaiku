-- CreateTable
CREATE TABLE "Proyek" (
    "id" SERIAL NOT NULL,
    "item" TEXT NOT NULL,
    "pic" TEXT NOT NULL,
    "input" TEXT,
    "output" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'saved',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proyek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "department" TEXT,
    "password" TEXT NOT NULL,
    "whatsapp" TEXT,
    "photo" TEXT,
    "fullName" TEXT,
    "role" TEXT,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaporanHarian" (
    "id" SERIAL NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "tanggalLaporan" TIMESTAMP(3) NOT NULL,
    "dariJam" TEXT NOT NULL,
    "hinggaJam" TEXT NOT NULL,
    "progressHarian" TEXT NOT NULL,
    "statusHarian" TEXT NOT NULL,
    "waktuPengiriman" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaporanHarian_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_username_key" ON "Employee"("username");
