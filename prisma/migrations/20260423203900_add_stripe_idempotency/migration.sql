-- SEGURIDAD: Abortar si existen duplicados que impidan los UNIQUE INDEX
DO $$ 
DECLARE 
    dup_tx INTEGER;
    dup_cp INTEGER;
BEGIN
    -- Contar duplicados en transactions
    SELECT COUNT(*) INTO dup_tx FROM (
        SELECT stripe_session_id FROM transactions WHERE stripe_session_id IS NOT NULL GROUP BY stripe_session_id HAVING COUNT(*) > 1
    ) AS t;

    -- Contar duplicados en coupon_usages
    SELECT COUNT(*) INTO dup_cp FROM (
        SELECT user_id, coupon_id FROM coupon_usages GROUP BY user_id, coupon_id HAVING COUNT(*) > 1
    ) AS c;

    IF dup_tx > 0 OR dup_cp > 0 THEN
        RAISE EXCEPTION 'ERROR: Limpieza requerida. Duplicados detectados: % en transacciones, % en cupones. Revisa SECURITY_PATCH_VERIFICATION.md para instrucciones de limpieza.', dup_tx, dup_cp;
    END IF;
END $$;

-- 1. Crear tabla de control de Idempotencia
CREATE TABLE "stripe_event_logs" (
    "id" TEXT NOT NULL,
    "stripe_event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_event_logs_pkey" PRIMARY KEY ("id")
);

-- 2. Crear Índices de Idempotencia
CREATE UNIQUE INDEX "stripe_event_logs_stripe_event_id_key" ON "stripe_event_logs"("stripe_event_id");
CREATE INDEX "stripe_event_logs_stripe_event_id_idx" ON "stripe_event_logs"("stripe_event_id");

-- 3. Aplicar Unique Constraints de negocio (Defensa en profundidad)
CREATE UNIQUE INDEX "transactions_stripe_session_id_key" ON "transactions"("stripe_session_id");
CREATE UNIQUE INDEX "coupon_usages_user_id_coupon_id_key" ON "coupon_usages"("user_id", "coupon_id");
