-- 20260831000000_startup_health_kpis.sql
-- RPC to calculate month-over-month (MoM) metrics for startup health

CREATE OR REPLACE FUNCTION startup_health_kpis()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    users_this_month integer;
    users_last_month integer;
    incidents_this_month integer;
    incidents_last_month integer;
    subscribers_this_month integer;
    subscribers_last_month integer;
    
    result json;
BEGIN
    -- users count
    SELECT count(*) INTO users_this_month 
    FROM public.users 
    WHERE date_trunc('month', created_at) = date_trunc('month', now());
    
    SELECT count(*) INTO users_last_month 
    FROM public.users 
    WHERE date_trunc('month', created_at) = date_trunc('month', now() - interval '1 month');

    -- incidents count
    SELECT count(*) INTO incidents_this_month 
    FROM incidents 
    WHERE date_trunc('month', created_at) = date_trunc('month', now());
    
    SELECT count(*) INTO incidents_last_month 
    FROM incidents 
    WHERE date_trunc('month', created_at) = date_trunc('month', now() - interval '1 month');

    -- newsletter_subscribers count
    SELECT count(*) INTO subscribers_this_month 
    FROM newsletter_subscribers 
    WHERE date_trunc('month', created_at) = date_trunc('month', now());
    
    SELECT count(*) INTO subscribers_last_month 
    FROM newsletter_subscribers 
    WHERE date_trunc('month', created_at) = date_trunc('month', now() - interval '1 month');

    result := json_build_object(
        'users', json_build_object(
            'this_month', users_this_month,
            'last_month', users_last_month
        ),
        'incidents', json_build_object(
            'this_month', incidents_this_month,
            'last_month', incidents_last_month
        ),
        'subscribers', json_build_object(
            'this_month', subscribers_this_month,
            'last_month', subscribers_last_month
        )
    );

    RETURN result;
END;
$$;

-- ROLLBACK:
-- DROP FUNCTION IF EXISTS startup_health_kpis();
