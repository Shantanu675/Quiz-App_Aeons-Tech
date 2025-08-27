import { useState, useContext } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios.js';

export default function CreateQuiz() {
  const { user } = useContext(AuthContext);
  const { register, control, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      title: '',
      description: '',
      timeLimitMinutes: 0,
      questions: [{
        text: '',
        options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
        correctOptions: [false, false, false, false],
        points: 1,
      }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'questions' });
  const navigate = useNavigate();
  const [error, setError] = useState('');

  console.log('User:', user, 'Token:', user?.token);

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
    return <p className="text-red-500">Access denied. Only admins or instructors can create quizzes.</p>;
  }

  const onSubmit = async (data) => {
    console.log('Submitting quiz:', JSON.stringify(data, null, 2));
    try {
      const transformed = {
        ...data,
        questions: data.questions.map(q => {
          const correctOptions = q.correctOptions
            .map((val, idx) => (val ? idx : -1))
            .filter(idx => idx !== -1);
          if (correctOptions.length === 0) {
            throw new Error(`At least one correct option is required for question ${q.text || 'unnamed'}`);
          }
          return {
            text: q.text,
            options: q.options.map(opt => ({ text: opt.text || '' })),
            correctOptions,
            points: Number(q.points) || 1,
          };
        }),
      };
      console.log('Transformed payload:', JSON.stringify(transformed, null, 2));
      const response = await api.post('/quizzes', transformed, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      console.log('Response:', response.status, response.data);
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.map(e => e.msg).join(', ') || err.response?.data?.msg || err.message || 'Failed to create quiz';
      console.error('Error:', errorMsg);
      setError(errorMsg);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create Quiz</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block mb-1">Title</label>
          <input
            {...register('title', { required: 'Title is required' })}
            className="w-full p-2 border rounded"
          />
          {errors.title && <p className="text-red-500">{errors.title.message}</p>}
        </div>
        <div className="mb-4">
          <label className="block mb-1">Description</label>
          <textarea
            {...register('description')}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Time Limit (minutes, 0 for none)</label>
          <input
            type="number"
            {...register('timeLimitMinutes', { required: 'Time limit is required', min: { value: 0, message: 'Time limit cannot be negative' } })}
            className="w-full p-2 border rounded"
          />
          {errors.timeLimitMinutes && <p className="text-red-500">{errors.timeLimitMinutes.message}</p>}
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="mb-6 border p-4 rounded">
            <h3 className="text-lg font-semibold">Question {index + 1}</h3>
            <div className="mb-2">
              <label className="block mb-1">Question Text</label>
              <input
                {...register(`questions.${index}.text`, { required: 'Question text is required' })}
                className="w-full p-2 border rounded"
              />
              {errors.questions?.[index]?.text && (
                <p className="text-red-500">{errors.questions[index].text.message}</p>
              )}
            </div>
            <div className="mb-2">
              <label className="block mb-1">Points</label>
              <input
                type="number"
                {...register(`questions.${index}.points`, { required: 'Points are required', min: { value: 1, message: 'Points must be at least 1' } })}
                defaultValue={1}
                className="w-full p-2 border rounded"
              />
              {errors.questions?.[index]?.points && (
                <p className="text-red-500">{errors.questions[index].points.message}</p>
              )}
            </div>
            <div className="mb-2">
              <label className="block mb-1">Options (select at least one correct option)</label>
              {field.options.map((_, optIdx) => (
                <div key={optIdx} className="flex items-center mb-1">
                  <input
                    {...register(`questions.${index}.options.${optIdx}.text`, { required: 'Option is required' })}
                    className="w-full p-2 border rounded mr-2"
                    placeholder={`Option ${optIdx + 1}`}
                    defaultValue=""
                  />
                  <label>
                    <Controller
                      name={`questions.${index}.correctOptions.${optIdx}`}
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={e => onChange(e.target.checked)}
                        />
                      )}
                    /> Correct
                  </label>
                </div>
              ))}
              {watch(`questions.${index}.correctOptions`).every(v => !v) && (
                <p className="text-red-500">At least one correct option is required</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-red-500"
            >
              Remove Question
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({
            text: '',
            options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
            correctOptions: [false, false, false, false],
            points: 1,
          })}
          className="mb-4 bg-green-500 text-white p-2 rounded"
        >
          Add Question
        </button>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded"
          disabled={Object.keys(errors).length > 0 || fields.some((_, i) => watch(`questions.${i}.correctOptions`).every(v => !v))}
        >
          Create Quiz
        </button>
      </form>
    </div>
  );
}