import Class from './Class';
import PropTypes from 'prop-types';

const Classes = ({ classes, teacherView, feedbackData }) => {
    return (
        <div className="ml-4 mr-4">
            <h1 className="text-2xl font-bold mb-4 text-[#B9E9F3]">Your Classes</h1>
            <div className="flex flex-wrap -mx-2">
                {classes.map((classData) => (
                    <div key={classData.id} className="px-2 mb-4 w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
                        {/* Added rounded-lg for rounded corners */}
                        <div className="rounded-lg overflow-hidden">
                            <Class classData={classData} teacherView={teacherView} feedbackData={feedbackData} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

Classes.propTypes = {
    classes: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      assignments: PropTypes.array.isRequired, // You can define the structure more deeply if you want
    })).isRequired,
    teacherView: PropTypes.bool,
    feedbackData: PropTypes.array,
};

export default Classes;
