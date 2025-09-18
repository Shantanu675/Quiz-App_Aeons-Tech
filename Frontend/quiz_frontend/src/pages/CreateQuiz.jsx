import { useState, useContext } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios.js';
import { motion } from 'framer-motion';
import SplitText from "../components/SplitText.jsx";

export default function CreateQuiz() {
  const { user } = useContext(AuthContext);
  const { register, control, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      title: '',
      description: '',
      date: '',
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

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
    return <p className="mt-8 text-red-500 text-center text-2xl font-semibold"><SplitText
      text="Access denied. Only admins or instructors can create quizzes."
      delay={100}
      duration={0.6}
      ease="power3.out"
      splitType="chars"
      from={{ opacity: 0, y: 40 }}
      to={{ opacity: 1, y: 0 }}
      threshold={0.1}
      rootMargin="-100px"
      textAlign="center"
    /></p>
  }

  const onSubmit = async (data) => {
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
      await api.post('/quizzes', transformed, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.map(e => e.msg).join(', ') || err.response?.data?.msg || err.message || 'Failed to create quiz';
      setError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-100 to-yellow-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8"
      >
        <h2 className="text-3xl font-extrabold text-center text-purple-700 mb-6 drop-shadow-md">
          📝 Create a New Quiz
        </h2>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Title */}
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Title</label>
            <input
              {...register('title', { required: 'Title is required' })}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-400"
              placeholder="Enter quiz title"
            />
            {errors.title && <p className="text-red-500">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Description</label>
            <textarea
              {...register('description')}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-400"
              placeholder="Enter a brief quiz description"
            />
          </div>

          {/* Date */}
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Date</label>
            <input
              {...register('date')}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-400"
              placeholder="Enter quiz date"
            />
          </div>

          {/* Time Limit */}
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Time Limit (minutes, 0 for none)</label>
            <input
              type="number"
              {...register('timeLimitMinutes', { required: 'Time limit is required', min: { value: 0, message: 'Time cannot be negative' } })}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-400"
            />
            {errors.timeLimitMinutes && <p className="text-red-500">{errors.timeLimitMinutes.message}</p>}
          </div>

          {/* Questions */}
          {fields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-6 border-2 border-purple-200 bg-purple-50 rounded-xl p-4 shadow-md"
            >
              <h3 className="text-lg font-semibold text-purple-600">Question {index + 1}</h3>
              <div className="mb-2">
                <label className="block mb-1">Question Text</label>
                <input
                  {...register(`questions.${index}.text`, { required: 'Question text is required' })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
                />
                {errors.questions?.[index]?.text && (
                  <p className="text-red-500">{errors.questions[index].text.message}</p>
                )}
              </div>

              {/* Points */}
              <div className="mb-2">
                <label className="block mb-1">Points</label>
                <input
                  type="number"
                  {...register(`questions.${index}.points`, { required: 'Points are required', min: { value: 1, message: 'Points must be at least 1' } })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
                />
                {errors.questions?.[index]?.points && (
                  <p className="text-red-500">{errors.questions[index].points.message}</p>
                )}
              </div>

              {/* Options */}
              <div className="mb-2">
                <label className="block mb-1">Options (select correct)</label>
                {field.options.map((_, optIdx) => (
                  <div key={optIdx} className="flex items-center mb-2">
                    <input
                      {...register(`questions.${index}.options.${optIdx}.text`, { required: 'Option is required' })}
                      placeholder={`Option ${optIdx + 1}`}
                      className="w-full p-2 border rounded-lg mr-2 focus:ring-2 focus:ring-purple-400"
                    />
                    <label className="flex items-center">
                      <Controller
                        name={`questions.${index}.correctOptions.${optIdx}`}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={e => onChange(e.target.checked)}
                            className="mr-1"
                          />
                        )}
                      /> ✅
                    </label>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-600 font-semibold hover:underline"
              >
                Remove Question
              </button>
            </motion.div>
          ))}

          {/* Buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => append({
                text: '',
                options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
                correctOptions: [false, false, false, false],
                points: 1,
              })}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl shadow-md transition m-2"
            >
              ➕ Add Question
            </button>
            <button
              type="submit"
              disabled={Object.keys(errors).length > 0 || fields.some((_, i) => watch(`questions.${i}.correctOptions`).every(v => !v))}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl shadow-md transition"
            >
              🚀 Create Quiz
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
