import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

router.get('/api/dummy-table', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('dummy_table')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch entries';
    res.status(500).json({ error: errorMessage });
  }
});

router.post('/api/dummy-table', async (req, res) => {
  try {
    const { sr_no, index_no, point_no } = req.body;

    if (sr_no === undefined || index_no === undefined || point_no === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: sr_no, index_no, point_no',
      });
    }

    const { data, error } = await supabase
      .from('dummy_table')
      .insert({
        sr_no: parseInt(sr_no),
        index_no: parseInt(index_no),
        point_no: parseFloat(point_no),
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create entry';
    res.status(500).json({ error: errorMessage });
  }
});

router.put('/api/dummy-table/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sr_no, index_no, point_no } = req.body;

    const { data, error } = await supabase
      .from('dummy_table')
      .update({
        ...(sr_no !== undefined && { sr_no: parseInt(sr_no) }),
        ...(index_no !== undefined && { index_no: parseInt(index_no) }),
        ...(point_no !== undefined && { point_no: parseFloat(point_no) }),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update entry';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete('/api/dummy-table/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('dummy_table')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(204).send();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete entry';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
