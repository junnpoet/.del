-- Closes duplicate pending join requests on approval and allows leaders to remove community members.
SET search_path = public, extensions;

CREATE OR REPLACE FUNCTION approve_join_request(request_id UUID)
RETURNS VOID AS $$
DECLARE
  v_req RECORD;
BEGIN
  SELECT * INTO v_req FROM public.group_join_requests WHERE id = request_id;
  IF v_req IS NULL THEN
    RAISE EXCEPTION 'Solicitud no encontrada';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.neighborhood_groups
    WHERE id = v_req.group_id AND leader_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No autorizado: Solo el dirigente del grupo puede aprobar solicitudes';
  END IF;

  UPDATE public.group_join_requests
  SET status = 'APPROVED'
  WHERE id = request_id;

  IF v_req.user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET group_id = v_req.group_id
    WHERE id = v_req.user_id;

    -- Close any other pending requests from the same user in this group
    UPDATE public.group_join_requests
    SET status = 'APPROVED'
    WHERE group_id = v_req.group_id
      AND status = 'PENDING'
      AND user_id = v_req.user_id;
  ELSIF v_req.whatsapp_phone IS NOT NULL THEN
    UPDATE public.group_join_requests
    SET status = 'APPROVED'
    WHERE group_id = v_req.group_id
      AND status = 'PENDING'
      AND whatsapp_phone = v_req.whatsapp_phone;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- Clean up any existing stale pending requests for users already admitted to the group
UPDATE public.group_join_requests gjr
SET status = 'APPROVED'
FROM public.profiles p
WHERE gjr.user_id = p.id
  AND gjr.group_id = p.group_id
  AND gjr.status = 'PENDING';

DROP FUNCTION IF EXISTS remove_group_member(UUID);

CREATE OR REPLACE FUNCTION remove_group_member(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_group_id UUID;
BEGIN
  SELECT p.group_id INTO v_group_id
  FROM public.profiles p
  WHERE p.id = target_user_id;

  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'El vecino no pertenece a ninguna comunidad';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'No puedes retirarte a ti mismo como dirigente';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.neighborhood_groups
    WHERE id = v_group_id AND leader_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No autorizado: Solo el dirigente del grupo puede gestionar miembros';
  END IF;

  UPDATE public.profiles
  SET group_id = NULL
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

GRANT EXECUTE ON FUNCTION remove_group_member(UUID) TO authenticated;
